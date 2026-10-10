import React, { useState } from 'react';
import { HeatStressMetrics, VulnerablePersona, RoomEnvironment, UserProfile } from '../types';
import { edgeAudio } from '../services/audioBuzzer';
import {
  AlertTriangle,
  Flame,
  Volume2,
  VolumeX,
  X,
  BellRing,
  ShieldAlert,
  Zap,
  Droplets,
  RotateCw,
  User,
} from 'lucide-react';

interface ExtremeHeatToastAlertProps {
  isVisible: boolean;
  onDismiss: () => void;
  metrics: HeatStressMetrics;
  persona: VulnerablePersona;
  room: RoomEnvironment;
  isMuted: boolean;
  setIsMuted: (val: boolean) => void;
  currentUser?: UserProfile | null;
}

export const ExtremeHeatToastAlert: React.FC<ExtremeHeatToastAlertProps> = ({
  isVisible,
  onDismiss,
  metrics,
  persona,
  room,
  isMuted,
  setIsMuted,
  currentUser,
}) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  if (!isVisible) return null;

  const handleReplayAlarm = () => {
    edgeAudio.playExtremeHeatWarningAlert();
  };

  const isExtremeDanger = metrics.riskCategory === 'extreme_danger';

  const personaDirectives: Record<VulnerablePersona, string> = {
    labourer:
      'OSHA MANDATE: Stop heavy physical labour immediately. Move to shaded misting zone. Enforce 15m work / 45m rest cycle.',
    student:
      'CHILD SAFETY: Evacuate uninsulated tin-roof classroom. Suspend sports and physical drills. Hydrate with electrolyte water.',
    elderly:
      'MEDICAL DIRECTIVE: High cardiovascular risk. Do not rely on dry fans alone (convection heating hazard). Engage evaporative cooling.',
    general:
      'HEATSTROKE HAZARD: Prolonged exposure will cause rapid heat exhaustion. Move to air-conditioned cooling sanctuary.',
  };

  return (
    <div className="fixed top-16 right-4 sm:right-6 z-50 max-w-md w-[calc(100vw-2rem)] transition-all duration-300">
      <div
        className={`rounded-2xl border backdrop-blur-xl p-4 shadow-2xl transition-all ${
          isExtremeDanger
            ? 'bg-gradient-to-b from-[#1c080d]/95 via-[#14060b]/95 to-[#0b0407]/95 border-rose-500/80 shadow-rose-950/80 ring-2 ring-rose-500/40'
            : 'bg-gradient-to-b from-[#1c1204]/95 via-[#140d04]/95 to-[#0c0903]/95 border-amber-500/80 shadow-amber-950/80 ring-2 ring-amber-500/40'
        }`}
      >
        {/* Animated Beacon Light Bar */}
        <div className="absolute -top-1 left-4 right-4 h-1 rounded-full overflow-hidden bg-rose-500/20">
          <div className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-rose-500 animate-pulse w-full" />
        </div>

        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3 mb-2 pt-1">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl flex items-center justify-center shrink-0 ${
                isExtremeDanger
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/50 animate-bounce'
                  : 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/50'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-rose-300">
                  {currentUser
                    ? `TARGETED ALERT: ${currentUser.name.toUpperCase()} (AGE ${currentUser.age})`
                    : isExtremeDanger
                    ? 'CRITICAL EXTREME THRESHOLD BREACH'
                    : 'ELEVATED HEAT STRESS ALERT'}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-200 border border-rose-500/40 font-bold">
                  EDGE AI SIREN
                </span>
              </div>
              <h4 className="text-sm font-extrabold text-white leading-tight">
                {metrics.riskLabel}
              </h4>
            </div>
          </div>

          {/* Dismiss and Minimize Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700/60 transition-colors"
              title={isMuted ? 'Unmute Sound' : 'Mute Warning Sound'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
            <button
              onClick={onDismiss}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700/60 transition-colors"
              title="Dismiss Alert Toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* User Specific Category Badge if logged in */}
        {currentUser && (
          <div className="mb-2 bg-slate-950/90 rounded-xl px-2.5 py-1.5 border border-amber-500/30 flex flex-wrap items-center justify-between gap-1 text-xs">
            <span className="text-slate-300 flex flex-wrap items-center gap-1.5">
              <span>{currentUser.persona === 'elderly' ? '👵' : currentUser.persona === 'student' ? '🎒' : currentUser.persona === 'labourer' ? '👷' : '👤'}</span>
              <strong className="text-amber-300">{currentUser.categoryLabel}</strong>
              <span className="text-slate-400 font-mono text-[10px]">
                (Age {currentUser.age}{currentUser.dateOfBirth ? ` · DOB: ${currentUser.dateOfBirth}` : ''}{currentUser.phone ? ` · 📱 ${currentUser.phone}` : ''})
              </span>
            </span>
            <span className="font-mono text-[10px] text-rose-400 font-bold shrink-0">
              Limit: {currentUser.safeThresholdWbgt}°C
            </span>
          </div>
        )}

        {/* Metric Badges Strip */}
        <div className="grid grid-cols-3 gap-2 my-2.5">
          <div className="bg-slate-950/80 rounded-xl p-2 border border-rose-500/30 text-center">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 block">WBGT Index</span>
            <span className="text-base font-bold font-mono text-rose-400">{metrics.wbgtOutdoor}°C</span>
          </div>

          <div className="bg-slate-950/80 rounded-xl p-2 border border-slate-800 text-center">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Feels Like (HI)</span>
            <span className="text-base font-bold font-mono text-amber-300">{metrics.heatIndex}°C</span>
          </div>

          <div className="bg-slate-950/80 rounded-xl p-2 border border-slate-800 text-center">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Rest Protocol</span>
            <span className="text-base font-bold font-mono text-rose-300">
              {metrics.restMinutesPerHour}m/hr
            </span>
          </div>
        </div>

        {/* Persona Specific Action Banner */}
        <div className="bg-slate-950/90 rounded-xl p-2.5 border border-rose-500/30 mb-3 text-xs leading-relaxed text-slate-200">
          <span className="text-amber-400 font-bold block mb-0.5 text-[11px] flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            Active Directive ({currentUser ? `${currentUser.name} · Age ${currentUser.age}` : persona.toUpperCase()}):
          </span>
          <p className="text-[11px] text-slate-300 font-medium">
            {currentUser?.categoryReason || personaDirectives[persona]}
          </p>
        </div>

        {/* Autonomous Edge Actions Activated */}
        <div className="flex items-center justify-between text-[11px] px-2 py-1.5 rounded-lg bg-rose-950/40 border border-rose-500/20 mb-3 text-rose-200">
          <span className="flex items-center gap-1.5 font-semibold">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Autonomous Edge Action:</span>
          </span>
          <span className="font-mono font-bold text-emerald-400">
            Relay 1 Cooler + Relay 2 Misting FIRED
          </span>
        </div>

        {/* Action Button Strip */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleReplayAlarm}
            className="flex-1 py-2 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-md shadow-rose-500/30 flex items-center justify-center gap-1.5 active:scale-95"
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>Replay Warning Siren</span>
          </button>

          <button
            onClick={onDismiss}
            className="py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700/60 transition-colors"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};
