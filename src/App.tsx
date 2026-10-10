import React, { useState, useEffect } from 'react';
import {
  SensorReadings,
  HeatStressMetrics,
  RelayStates,
  PowerSystemState,
  VulnerablePersona,
  RoomEnvironment,
} from './types';
import { INITIAL_ROOM_READINGS } from './services/mockDataGenerator';
import { evaluateHeatStress } from './services/heatCalculations';
import { edgeAudio } from './services/audioBuzzer';
import { Sidebar, NavTab } from './components/Sidebar';
import { HeaderBar } from './components/HeaderBar';
import { DashboardOverview } from './components/DashboardOverview';
import { SensorsTelemetryView } from './components/SensorsTelemetryView';
import { ThermalPredictorView } from './components/ThermalPredictorView';
import { WorksiteRestBreaksView } from './components/WorksiteRestBreaksView';
import { MunicipalHeatMapView } from './components/MunicipalHeatMapView';
import { PowerOutageResilienceView } from './components/PowerOutageResilienceView';
import { HardwareFirmwareView } from './components/HardwareFirmwareView';
import { HardwareBridgeModal } from './components/HardwareBridgeModal';
import { ExtremeHeatToastAlert } from './components/ExtremeHeatToastAlert';
import { ThermalHistoryLog } from './components/ThermalHistoryLog';
import { AuthModal } from './components/AuthModal';
import { UserProfile } from './types';
import { getStoredUserProfile, clearStoredUserProfile } from './services/userCategoryClassifier';
import { CheckCircle2, X } from 'lucide-react';

export const App: React.FC = () => {
  // User Authentication & Age Classification Profile
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getStoredUserProfile());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authNotificationMessage, setAuthNotificationMessage] = useState<string | null>(null);

  // Navigation & UI states
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isMobilePreview, setIsMobilePreview] = useState<boolean>(false);
  const [isBridgeModalOpen, setIsBridgeModalOpen] = useState<boolean>(false);
  const [isHardwareConnected, setIsHardwareConnected] = useState<boolean>(false);
  const [isExtremeToastVisible, setIsExtremeToastVisible] = useState<boolean>(false);

  // References for threshold edge detection
  const prevRiskCategoryRef = React.useRef<string>('');
  const prevRoomRef = React.useRef<string>('');

  // Core domain state
  const [currentRoom, setCurrentRoom] = useState<RoomEnvironment>('tin_roof');
  const [currentPersona, setCurrentPersona] = useState<VulnerablePersona>(() => {
    const user = getStoredUserProfile();
    return user ? user.persona : 'labourer';
  });
  const [targetReliefTemp, setTargetReliefTemp] = useState<number>(28.5);

  // Synchronize persona when authenticated user profile changes
  useEffect(() => {
    if (currentUser) {
      setCurrentPersona(currentUser.persona);
    }
  }, [currentUser]);

  // Sensor telemetry state
  const [readings, setReadings] = useState<SensorReadings>(
    INITIAL_ROOM_READINGS.tin_roof
  );

  // Hardware relays state
  const [relays, setRelays] = useState<RelayStates>({
    evaporativeCooler: true,
    mistingSprinkler: false,
    ventilationLouvers: true,
    restBreakBuzzer: false,
    autoControlEnabled: true,
  });

  // Power & Outage Resilience subsystem state
  const [powerState, setPowerState] = useState<PowerSystemState>({
    batterySoC: 94,
    batteryVoltage: 13.2,
    solarWatts: 72,
    loadWatts: 14.2,
    gridConnected: false, // Default to Outage / LiFePO4 mode to demonstrate resilience!
    estimatedRuntimeHours: 38.5,
    deepSleepActive: true,
    cachedOfflinePackets: 48,
  });

  // Update sensor readings when room environment changes
  useEffect(() => {
    setReadings(INITIAL_ROOM_READINGS[currentRoom]);
  }, [currentRoom]);

  // Synchronize audio mute state
  useEffect(() => {
    edgeAudio.setMuted(isMuted);
  }, [isMuted]);

  // Compute real heat stress metrics
  const metrics: HeatStressMetrics = evaluateHeatStress(readings, currentPersona);

  // Edge AI Autonomous Actuation Engine (running locally without cloud)
  useEffect(() => {
    if (!relays.autoControlEnabled) return;

    if (metrics.wbgtOutdoor >= 32.0) {
      setRelays((prev) => ({
        ...prev,
        evaporativeCooler: true,
        mistingSprinkler: true,
        ventilationLouvers: true,
        restBreakBuzzer: currentPersona === 'labourer',
      }));
    } else if (metrics.wbgtOutdoor >= 30.0) {
      setRelays((prev) => ({
        ...prev,
        evaporativeCooler: true,
        mistingSprinkler: false,
        ventilationLouvers: true,
        restBreakBuzzer: false,
      }));
    } else {
      setRelays((prev) => ({
        ...prev,
        evaporativeCooler: false,
        mistingSprinkler: false,
        ventilationLouvers: false,
        restBreakBuzzer: false,
      }));
    }
  }, [metrics.wbgtOutdoor, currentPersona, relays.autoControlEnabled]);

  // Automated Extreme WBGT Threshold Toast & Audio Warning Notification
  useEffect(() => {
    // Extreme threshold check (ISO / OSHA standard: WBGT >= 32°C or user's personalized safe threshold)
    const userSafeLimit = currentUser ? currentUser.safeThresholdWbgt : 32.0;
    const isExceeded = metrics.wbgtOutdoor >= userSafeLimit;
    const isExtreme =
      metrics.riskCategory === 'extreme_danger' ||
      metrics.riskCategory === 'extreme_caution' ||
      metrics.riskCategory === 'danger' ||
      isExceeded;

    const categoryChanged = prevRiskCategoryRef.current !== metrics.riskCategory;
    const roomChanged = prevRoomRef.current !== currentRoom;

    // Trigger visual toast and warning audio siren upon entering extreme conditions
    if (isExtreme && (categoryChanged || roomChanged)) {
      setIsExtremeToastVisible(true);
      edgeAudio.playExtremeHeatWarningAlert();
    }

    prevRiskCategoryRef.current = metrics.riskCategory;
    prevRoomRef.current = currentRoom;
  }, [metrics.riskCategory, metrics.wbgtOutdoor, currentRoom, currentUser]);

  const triggerExtremeAlert = () => {
    setIsExtremeToastVisible(true);
    edgeAudio.playExtremeHeatWarningAlert();
  };

  // View Switcher Router
  const renderCurrentView = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <DashboardOverview
            readings={readings}
            setReadings={setReadings}
            metrics={metrics}
            relays={relays}
            setRelays={setRelays}
            powerState={powerState}
            setPowerState={setPowerState}
            persona={currentPersona}
            setPersona={setCurrentPersona}
            room={currentRoom}
            targetReliefTemp={targetReliefTemp}
            setTargetReliefTemp={setTargetReliefTemp}
            onNavigateToHistory={() => setActiveTab('history_log')}
            currentUser={currentUser}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onTriggerAlert={triggerExtremeAlert}
          />
        );
      case 'telemetry':
        return (
          <SensorsTelemetryView
            readings={readings}
            setReadings={setReadings}
            metrics={metrics}
            onTriggerExtremeAlert={triggerExtremeAlert}
          />
        );
      case 'forecast':
        return (
          <ThermalPredictorView
            readings={readings}
            room={currentRoom}
            setRoom={setCurrentRoom}
          />
        );
      case 'rest_breaks':
        return (
          <WorksiteRestBreaksView
            metrics={metrics}
            persona={currentPersona}
          />
        );
      case 'city_map':
        return <MunicipalHeatMapView />;
      case 'power_grid':
        return (
          <PowerOutageResilienceView
            powerState={powerState}
            setPowerState={setPowerState}
          />
        );
      case 'history_log':
        return (
          <ThermalHistoryLog
            currentReadings={readings}
            currentRoom={currentRoom}
            currentPersona={currentPersona}
            currentMetrics={metrics}
            gridConnected={powerState.gridConnected}
          />
        );
      case 'firmware':
        return (
          <HardwareFirmwareView
            isHardwareConnected={isHardwareConnected}
            setIsHardwareConnected={setIsHardwareConnected}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {isMobilePreview ? (
        /* Mobile App Preview Container */
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-[#06080e]">
          <div className="w-full max-w-[420px] h-[880px] bg-[#0c101d] rounded-[48px] border-[10px] border-slate-800 shadow-2xl flex flex-col overflow-hidden relative">
            {/* Phone Speaker Notch */}
            <div className="absolute top-0 inset-x-0 h-6 flex justify-center items-center z-50 pointer-events-none">
              <div className="w-32 h-4 bg-slate-900 rounded-b-xl border border-slate-800/80" />
            </div>

            {/* Mobile Header Bar */}
            <div className="pt-7 px-4 pb-2 bg-[#0e1424] border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-white">ThermaEdge Mobile</span>
                <span className="text-[9px] font-mono px-1 bg-amber-500/20 text-amber-300 rounded">
                  UNO Q
                </span>
              </div>
              <div className="flex items-center gap-2">
                {currentUser ? (
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-bold"
                  >
                    <span>
                      {currentUser.persona === 'elderly'
                        ? '👵'
                        : currentUser.persona === 'student'
                        ? '🎒'
                        : currentUser.persona === 'labourer'
                        ? '👷'
                        : '👤'}
                    </span>
                    <span>Age {currentUser.age}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="px-2 py-1 rounded-lg bg-amber-500 text-slate-950 text-[10px] font-bold"
                  >
                    Sign In / Age
                  </button>
                )}
                <button
                  onClick={triggerExtremeAlert}
                  className="p-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold"
                  title="Test Extreme Toast Alert"
                >
                  ⚠️ Alert
                </button>
                <button
                  onClick={() => setIsMobilePreview(false)}
                  className="text-[11px] text-amber-400 font-semibold underline"
                >
                  Exit App Mode
                </button>
              </div>
            </div>

            {/* Mobile View Scroll Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {renderCurrentView()}
            </div>

            {/* Mobile Bottom Navigation Bar */}
            <div className="bg-[#0e1424] border-t border-slate-800 px-3 py-2 flex justify-around text-[10px]">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex flex-col items-center ${activeTab === 'overview' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
              >
                <span>🏠</span>
                <span>Home</span>
              </button>
              <button
                onClick={() => setActiveTab('telemetry')}
                className={`flex flex-col items-center ${activeTab === 'telemetry' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
              >
                <span>🌡️</span>
                <span>Sensors</span>
              </button>
              <button
                onClick={() => setActiveTab('forecast')}
                className={`flex flex-col items-center ${activeTab === 'forecast' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
              >
                <span>📈</span>
                <span>AI Predict</span>
              </button>
              <button
                onClick={() => setActiveTab('rest_breaks')}
                className={`flex flex-col items-center ${activeTab === 'rest_breaks' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
              >
                <span>🚨</span>
                <span>Breaks</span>
              </button>
              <button
                onClick={() => setActiveTab('city_map')}
                className={`flex flex-col items-center ${activeTab === 'city_map' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
              >
                <span>🗺️</span>
                <span>Heat Map</span>
              </button>
              <button
                onClick={() => setActiveTab('history_log')}
                className={`flex flex-col items-center ${activeTab === 'history_log' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
              >
                <span>📑</span>
                <span>History</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Full Desktop Layout (Sidebar + Header + Viewport) */
        <div className="flex flex-1">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isMuted={isMuted}
            setIsMuted={setIsMuted}
            isMobilePreview={isMobilePreview}
            setIsMobilePreview={setIsMobilePreview}
            currentUser={currentUser}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />

          <div className="flex-1 flex flex-col min-w-0">
            <HeaderBar
              currentRoom={currentRoom}
              setCurrentRoom={setCurrentRoom}
              currentPersona={currentPersona}
              setCurrentPersona={setCurrentPersona}
              gridConnected={powerState.gridConnected}
              setGridConnected={(val) => {
                if (typeof val === 'function') {
                  setPowerState((p) => ({ ...p, gridConnected: val(p.gridConnected) }));
                } else {
                  setPowerState((p) => ({ ...p, gridConnected: val }));
                }
              }}
              isHardwareConnected={isHardwareConnected}
              onOpenHardwareBridge={() => setIsBridgeModalOpen(true)}
              metrics={metrics}
              onTriggerExtremeAlert={triggerExtremeAlert}
              currentUser={currentUser}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              onSignOut={() => {
                clearStoredUserProfile();
                setCurrentUser(null);
              }}
            />

            <main className="flex-1 p-6 max-w-7xl w-full mx-auto overflow-y-auto">
              {renderCurrentView()}
            </main>
          </div>
        </div>
      )}

      {/* Floating Extreme Heat Toast Alert Notification */}
      <ExtremeHeatToastAlert
        isVisible={isExtremeToastVisible}
        onDismiss={() => setIsExtremeToastVisible(false)}
        metrics={metrics}
        persona={currentPersona}
        room={currentRoom}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        currentUser={currentUser}
      />

      {/* Hardware Connection Modal */}
      <HardwareBridgeModal
        isOpen={isBridgeModalOpen}
        onClose={() => setIsBridgeModalOpen(false)}
        isHardwareConnected={isHardwareConnected}
        setIsHardwareConnected={setIsHardwareConnected}
      />

      {/* User Authentication & Age Classification Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onSignOut={() => {
          clearStoredUserProfile();
          setCurrentUser(null);
        }}
        onUserAuthenticated={(profile) => {
          setCurrentUser(profile);
          setCurrentPersona(profile.persona);
          setAuthNotificationMessage(
            `Mobile +91 ${profile.phone || ''} verified. Date of Birth (${profile.dateOfBirth || ''}) analyzed as Age ${profile.age}. Category: ${profile.categoryLabel} (Safe Limit: ${profile.safeThresholdWbgt}°C WBGT).`
          );
          setTimeout(() => setAuthNotificationMessage(null), 7000);

          // If current room conditions already breach the user's specific age category limit, alert immediately!
          if (metrics.wbgtOutdoor >= profile.safeThresholdWbgt) {
            setIsExtremeToastVisible(true);
            edgeAudio.playExtremeHeatWarningAlert();
          }
        }}
      />

      {/* In-App Authentication & Profile Notification Alert */}
      {authNotificationMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0e1424]/95 border border-emerald-500/60 rounded-2xl p-4 shadow-2xl backdrop-blur-md flex items-start gap-3 max-w-md animate-fade-in ring-1 ring-emerald-500/30">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <span className="text-xs font-bold text-white block">
              Profile &amp; Category Calibrated Successfully
            </span>
            <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
              {authNotificationMessage}
            </p>
          </div>
          <button
            onClick={() => setAuthNotificationMessage(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
