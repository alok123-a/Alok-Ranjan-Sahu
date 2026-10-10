import React from 'react';
import {
  RoomEnvironment,
  VulnerablePersona,
  HeatStressMetrics,
  UserProfile,
} from '../types';
import {
  Zap,
  ZapOff,
  Bell,
  Cpu,
  Users,
  Home,
  CheckCircle2,
  AlertTriangle,
  User,
  ShieldCheck,
} from 'lucide-react';
import { edgeAudio } from '../services/audioBuzzer';

interface HeaderBarProps {
  currentRoom: RoomEnvironment;
  setCurrentRoom: (room: RoomEnvironment) => void;
  currentPersona: VulnerablePersona;
  setCurrentPersona: (persona: VulnerablePersona) => void;
  gridConnected: boolean;
  setGridConnected: React.Dispatch<React.SetStateAction<boolean>>;
  isHardwareConnected: boolean;
  onOpenHardwareBridge: () => void;
  metrics: HeatStressMetrics;
  onTriggerExtremeAlert?: () => void;
  currentUser: UserProfile | null;
  onOpenAuthModal: () => void;
  onSignOut?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentRoom,
  setCurrentRoom,
  currentPersona,
  setCurrentPersona,
  gridConnected,
  setGridConnected,
  isHardwareConnected,
  onOpenHardwareBridge,
  metrics,
  onTriggerExtremeAlert,
  currentUser,
  onOpenAuthModal,
  onSignOut,
}) => {
  const roomLabels: Record<RoomEnvironment, { label: string; icon: string }> = {
    tin_roof: { label: 'Tin-Roof Rooftop', icon: '🏠' },
    construction_site: { label: 'Highway Works', icon: '🏗️' },
    school_classroom: { label: 'School Classroom', icon: '🏫' },
    elderly_residence: { label: 'Elderly Home', icon: '🛋️' },
    factory_floor: { label: 'Industrial Shed', icon: '🏭' },
  };

  const personaLabels: Record<VulnerablePersona, { label: string; tag: string }> = {
    labourer: { label: 'Outdoor Labourer', tag: 'High Metabolic Rate' },
    student: { label: 'School Child', tag: 'Dehydration Vulnerable' },
    elderly: { label: 'Elderly Citizen', tag: 'Cardiovascular Risk' },
    general: { label: 'General Citizen', tag: 'Standard Baseline' },
  };

  const handleTestBuzzer = () => {
    edgeAudio.playRestBreakAlert();
  };

  const isExtremeAlert = metrics.riskCategory === 'danger' || metrics.riskCategory === 'extreme_danger';

  return (
    <header className="bg-[#0e1424]/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-3 sticky top-0 z-20">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left Zone: Room Environment Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          <div className="text-xs font-semibold text-slate-400 mr-2 flex items-center gap-1 shrink-0">
            <Home className="w-3.5 h-3.5 text-amber-400" />
            <span>Zone:</span>
          </div>
          {(Object.keys(roomLabels) as RoomEnvironment[]).map((key) => {
            const isSelected = currentRoom === key;
            return (
              <button
                key={key}
                onClick={() => setCurrentRoom(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <span>{roomLabels[key].icon}</span>
                <span>{roomLabels[key].label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Zone: Controls & Status */}
        <div className="flex items-center gap-3">
          {/* User Sign In / Profile Button (Age-based Vulnerability Badge) */}
          {currentUser ? (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 text-indigo-300 border border-indigo-500/40 hover:border-indigo-400 transition-all shadow-sm"
              title="Click to view or edit personal age and category settings"
            >
              <span className="text-base">
                {currentUser.persona === 'elderly'
                  ? '👵'
                  : currentUser.persona === 'student'
                  ? '🎒'
                  : currentUser.persona === 'labourer'
                  ? '👷'
                  : '👤'}
              </span>
              <div className="text-left hidden sm:block">
                <span className="font-bold text-white block text-xs leading-none truncate max-w-[110px]">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-indigo-300 block">
                  Age {currentUser.age} · {currentUser.phone ? `+91 ${currentUser.phone.slice(-10)}` : currentUser.persona.toUpperCase()}
                </span>
              </div>
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md shadow-amber-500/20"
              title="Sign in or register with your age to calibrate personalized alerts"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In / Sign Up</span>
            </button>
          )}

          {/* Persona Selector Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
            <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-slate-400 hidden sm:inline">Persona:</span>
            <select
              value={currentPersona}
              onChange={(e) => setCurrentPersona(e.target.value as VulnerablePersona)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer pr-1"
            >
              {(Object.keys(personaLabels) as VulnerablePersona[]).map((p) => (
                <option key={p} value={p} className="bg-slate-900 text-white">
                  {personaLabels[p].label}
                </option>
              ))}
            </select>
          </div>

          {/* Grid Failure Simulator Toggle */}
          <button
            onClick={() => setGridConnected(!gridConnected)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              gridConnected
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30 animate-pulse'
            }`}
            title="Toggle power grid state to test Edge AI autonomy during blackouts"
          >
            {gridConnected ? (
              <>
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Grid Normal</span>
              </>
            ) : (
              <>
                <ZapOff className="w-3.5 h-3.5 text-rose-400" />
                <span>Grid Cut (Solar LiFePO4 Mode)</span>
              </>
            )}
          </button>

          {/* Buzzer Test button */}
          <button
            onClick={handleTestBuzzer}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isExtremeAlert
                ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md shadow-orange-500/30 animate-pulse'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
            }`}
            title="Sound the edge rest-break buzzer"
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Edge Siren</span>
          </button>

          {/* Arduino UNO Q Hardware Connection Button */}
          <button
            onClick={onOpenHardwareBridge}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isHardwareConnected
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-cyan-500/40 hover:text-cyan-400'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">
              {isHardwareConnected ? 'Arduino UNO Q: Live USB' : 'UNO Q Bridge'}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                isHardwareConnected ? 'bg-cyan-400 animate-ping' : 'bg-emerald-400'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Critical Heat Alert Banner if severe */}
      {isExtremeAlert && (
        <div
          onClick={onTriggerExtremeAlert}
          className="mt-2.5 bg-gradient-to-r from-rose-950/80 via-rose-900/40 to-slate-900 border border-rose-500/40 rounded-xl px-4 py-2 flex items-center justify-between cursor-pointer hover:border-rose-400 transition-colors"
          title="Click to view full Extreme Heat Toast Alert"
        >
          <div className="flex items-center gap-2 text-rose-300 text-xs font-medium">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-bounce" />
            <span>
              <strong>HEAT STRESS ALERT:</strong> {metrics.riskLabel} — Outdoor WBGT reaches{' '}
              <span className="font-mono font-bold text-rose-200">{metrics.wbgtOutdoor}°C</span> (Heat Index{' '}
              <span className="font-mono font-bold text-rose-200">{metrics.heatIndex}°C</span>). Autonomous relief active.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded border border-rose-500/30">
              Rest {metrics.restMinutesPerHour}m / hr
            </span>
            <span className="text-[10px] uppercase font-bold text-rose-400 underline">
              View Alert
            </span>
          </div>
        </div>
      )}
    </header>
  );
};
