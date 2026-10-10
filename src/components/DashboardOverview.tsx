import React from 'react';
import {
  SensorReadings,
  HeatStressMetrics,
  RelayStates,
  PowerSystemState,
  VulnerablePersona,
  RoomEnvironment,
  UserProfile,
} from '../types';
import { ArcGauge } from './ArcGauge';
import { ThermalCameraMatrix } from './ThermalCameraMatrix';
import { RelayControls } from './RelayControls';
import { PowerOutageCard } from './PowerOutageCard';
import { PersonaRiskCard } from './PersonaRiskCard';
import { HeatTrendChart24H } from './HeatTrendChart24H';
import { WeatherForecast5Day } from './WeatherForecast5Day';
import { edgeAudio } from '../services/audioBuzzer';
import {
  Droplets,
  Wind,
  Sun,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Calendar,
  Layers,
  FileSpreadsheet,
  ArrowRight,
  User,
  Volume2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface DashboardOverviewProps {
  readings: SensorReadings;
  setReadings: React.Dispatch<React.SetStateAction<SensorReadings>>;
  metrics: HeatStressMetrics;
  relays: RelayStates;
  setRelays: React.Dispatch<React.SetStateAction<RelayStates>>;
  powerState: PowerSystemState;
  setPowerState: React.Dispatch<React.SetStateAction<PowerSystemState>>;
  persona: VulnerablePersona;
  setPersona: (p: VulnerablePersona) => void;
  room: RoomEnvironment;
  targetReliefTemp: number;
  setTargetReliefTemp: React.Dispatch<React.SetStateAction<number>>;
  onNavigateToHistory?: () => void;
  currentUser?: UserProfile | null;
  onOpenAuthModal?: () => void;
  onTriggerAlert?: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  readings,
  setReadings,
  metrics,
  relays,
  setRelays,
  powerState,
  setPowerState,
  persona,
  setPersona,
  room,
  targetReliefTemp,
  setTargetReliefTemp,
  onNavigateToHistory,
  currentUser,
  onOpenAuthModal,
  onTriggerAlert,
}) => {
  const roomNames: Record<RoomEnvironment, string> = {
    tin_roof: 'Unit-8 Informal Slum / Rooftop Room',
    construction_site: 'NH-16 Highway Flyover Works',
    school_classroom: 'Capital Primary School (Class 4B)',
    elderly_residence: 'Saheed Nagar Senior Residence',
    factory_floor: 'Mancheswar Industrial Shed',
  };

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="space-y-5">
      {/* Personalized Age Profile & Categorized Alert Banner */}
      {currentUser ? (
        <div
          className={`rounded-2xl p-4 border transition-all shadow-xl ${
            metrics.wbgtOutdoor >= currentUser.safeThresholdWbgt
              ? 'bg-gradient-to-r from-rose-950/70 via-rose-900/40 to-slate-900/90 border-rose-500/60 shadow-rose-950/50'
              : 'bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900/80 border-indigo-500/40 shadow-indigo-950/30'
          }`}
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-amber-500/40 flex items-center justify-center text-2xl shadow-inner shrink-0">
                {currentUser.persona === 'elderly'
                  ? '👵'
                  : currentUser.persona === 'student'
                  ? '🎒'
                  : currentUser.persona === 'labourer'
                  ? '👷'
                  : '👤'}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-sm font-extrabold text-white">
                    {currentUser.name}
                  </h3>
                  <span className="text-xs font-mono font-black px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Age {currentUser.age}
                  </span>
                  {currentUser.dateOfBirth && (
                    <span className="text-xs font-mono px-2 py-0.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-700">
                      DOB: {currentUser.dateOfBirth}
                    </span>
                  )}
                  {currentUser.phone && (
                    <span className="text-xs font-mono px-2 py-0.5 rounded-lg bg-slate-900 text-indigo-300 border border-indigo-500/30">
                      📱 +91 {currentUser.phone.slice(-10)}
                    </span>
                  )}
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-200 border border-indigo-500/30">
                    {currentUser.categoryLabel}
                  </span>
                  {metrics.wbgtOutdoor >= currentUser.safeThresholdWbgt ? (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-rose-500/30 text-rose-200 border border-rose-500/50 flex items-center gap-1 animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      <span>ALERT ACTIVE: LIMIT EXCEEDED</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Safe Range</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                  {currentUser.categoryReason}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-end lg:self-center shrink-0">
              <div className="text-right px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                <span className="text-[10px] text-slate-400 block">Personal Safe Limit:</span>
                <span className="font-mono font-bold text-rose-300">
                  {currentUser.safeThresholdWbgt}°C WBGT
                </span>
              </div>

              <button
                onClick={() => edgeAudio.playExtremeHeatWarningAlert()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-400 text-white shadow-md shadow-rose-500/20 transition-all"
                title="Test warning audio alert configured for this user"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Test Alert Siren</span>
              </button>

              {onOpenAuthModal && (
                <button
                  onClick={onOpenAuthModal}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                  title="Change age or switch profile"
                >
                  Edit Age / Profile
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-[#0e1424] border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white block">
                  Mobile Sign Up &amp; Date of Birth Heat Risk Analysis
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                  Instant • No Real-Time OTP
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Sign up instantly with mobile number &amp; password (no real-time OTP wait required), provide your Date of Birth, and ThermaEdge will automatically analyze your age category and trigger personalized warning sirens.
              </p>
            </div>
          </div>

          {onOpenAuthModal && (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shrink-0 shadow-md shadow-amber-500/20"
            >
              <User className="w-3.5 h-3.5" />
              <span>Mobile Sign Up / Login (Set DOB)</span>
            </button>
          )}
        </div>
      )}

      {/* Top Hero Section: Weather Microclimate Card & Thermal Camera View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Weather Microclimate Card (Inspired by reference NexHome weather widget) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl overflow-hidden border border-slate-800 flex flex-col justify-between relative min-h-[290px]">
          {/* Background Illustration */}
          <div className="absolute inset-0 z-0">
            <img
              src="/src/assets/images/heatwave_sunset_landscape_1791305206025.jpg"
              alt="Urban Heatwave Microclimate"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-35 filter saturate-150"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-[#0e1424]/80 to-transparent" />
          </div>

          {/* Top Info */}
          <div className="p-4 z-10 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-amber-300 font-medium mb-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{roomNames[room]}</span>
              </div>
              <div className="text-[11px] text-slate-300 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>{todayStr}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                SHT41 + BME688
              </span>
            </div>
          </div>

          {/* Center Main Temperature Display */}
          <div className="p-4 z-10">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-extrabold text-white tracking-tight font-mono tabular-nums">
                {readings.ambientTemp}
              </span>
              <span className="text-2xl text-slate-400 font-medium">°C</span>
              <span className="ml-3 text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Heat Stress Active
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Local Microclimate Warning: Radiant globe at{' '}
              <strong className="text-amber-300 font-mono">{readings.blackGlobeTemp}°C</strong> (Sun load{' '}
              <span className="font-mono">{readings.solarIrradiance} W/m²</span>)
            </p>
          </div>

          {/* Bottom Telemetry Strip */}
          <div className="p-3 bg-slate-950/70 border-t border-slate-800/80 z-10 grid grid-cols-3 gap-2 text-center">
            <div className="flex items-center justify-center gap-1.5">
              <Droplets className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block">Humidity</span>
                <span className="text-xs font-bold text-white font-mono">{readings.relativeHumidity}%</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 border-x border-slate-800">
              <Wind className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block">Wind Velocity</span>
                <span className="text-xs font-bold text-white font-mono">{readings.windSpeed} m/s</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block">VOC Index</span>
                <span className="text-xs font-bold text-white font-mono">{readings.airQualityVOC}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Thermal Camera View (MLX90640 surface array) */}
        <div className="lg:col-span-7">
          <ThermalCameraMatrix
            maxRoofTemp={readings.roofSurfaceTemp}
            ambientTemp={readings.ambientTemp}
            roomName={roomNames[room]}
          />
        </div>
      </div>

      {/* Middle Grid: Gauges & Relay Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
        {/* WBGT Wet Bulb Globe Gauge */}
        <div className="lg:col-span-4">
          <ArcGauge
            value={metrics.wbgtOutdoor}
            min={20}
            max={45}
            label="Real WBGT Heat Stress"
            subtitle={metrics.riskLabel}
            colorScheme={
              metrics.wbgtOutdoor >= 34
                ? 'rose'
                : metrics.wbgtOutdoor >= 30
                ? 'orange'
                : 'emerald'
            }
            targetValue={targetReliefTemp}
            onIncrement={() => setTargetReliefTemp((t) => Math.min(36, t + 0.5))}
            onDecrement={() => setTargetReliefTemp((t) => Math.max(24, t - 0.5))}
          />
        </div>

        {/* NOAA Heat Index & Dew Point Gauge */}
        <div className="lg:col-span-4">
          <ArcGauge
            value={metrics.heatIndex}
            min={24}
            max={55}
            label="NOAA Heat Index (Feels Like)"
            subtitle={`Dew Point: ${metrics.dewPoint}°C`}
            colorScheme="orange"
          />
        </div>

        {/* Humidex / Natural Wet Bulb Gauge */}
        <div className="lg:col-span-4">
          <ArcGauge
            value={metrics.humidex}
            min={20}
            max={55}
            label="Humidex Physiological Scale"
            subtitle={`Wet Bulb: ${metrics.naturalWetBulb}°C`}
            colorScheme="cyan"
          />
        </div>
      </div>

      {/* 24-Hour WBGT Heat Stress Trend Visualization (Recharts) */}
      <div>
        <HeatTrendChart24H
          currentReadings={readings}
          currentRoom={room}
          currentWBGT={metrics.wbgtOutdoor}
        />
      </div>

      {/* 5-Day External Ambient Forecast Grounded via Google Search */}
      <div>
        <WeatherForecast5Day currentRoom={room} />
      </div>

      {/* Analytical Research & CSV Export Quick Callout */}
      {onNavigateToHistory && (
        <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">
                BPUT Hackathon 2026 Analytical Research Dataset
              </span>
              <p className="text-[11px] text-slate-400">
                Access longitudinal microclimate logs, extreme heat event audit trails, and export raw data to CSV for Python/R statistical analysis.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToHistory}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shrink-0 shadow-md shadow-emerald-500/20"
          >
            <span>Open Thermal History Log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Bottom Grid: Relays, Persona Risk & Power Outage Resilience */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: 4-Channel Relays & Autonomous Actuation */}
        <div className="lg:col-span-6">
          <RelayControls relays={relays} setRelays={setRelays} wbgt={metrics.wbgtOutdoor} />
        </div>

        {/* Right: Solar + LiFePO4 Power Outage Card */}
        <div className="lg:col-span-6">
          <PowerOutageCard powerState={powerState} setPowerState={setPowerState} />
        </div>
      </div>

      {/* Persona Risk Card full width banner */}
      <div>
        <PersonaRiskCard
          persona={persona}
          metrics={metrics}
          onSelectPersona={setPersona}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
};
