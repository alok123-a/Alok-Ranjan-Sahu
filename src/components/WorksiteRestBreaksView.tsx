import React, { useState, useEffect } from 'react';
import { HeatStressMetrics, VulnerablePersona } from '../types';
import { edgeAudio } from '../services/audioBuzzer';
import {
  Clock,
  Bell,
  Droplets,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Shield,
} from 'lucide-react';

interface WorksiteRestBreaksViewProps {
  metrics: HeatStressMetrics;
  persona: VulnerablePersona;
}

export const WorksiteRestBreaksView: React.FC<WorksiteRestBreaksViewProps> = ({
  metrics,
  persona,
}) => {
  const [cycleType, setCycleType] = useState<'work' | 'rest'>('work');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(metrics.maxContinuousWorkMinutes * 60);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [waterLoggedMl, setWaterLoggedMl] = useState<number>(250);

  // Update timer target if metrics change
  useEffect(() => {
    if (cycleType === 'work') {
      setSecondsRemaining(metrics.maxContinuousWorkMinutes * 60);
    } else {
      setSecondsRemaining(Math.max(10, metrics.restMinutesPerHour) * 60);
    }
  }, [metrics.maxContinuousWorkMinutes, metrics.restMinutesPerHour, cycleType]);

  // Active countdown timer
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Switch cycle and sound siren!
          edgeAudio.playRestBreakAlert();
          if (cycleType === 'work') {
            setCycleType('rest');
            return Math.max(10, metrics.restMinutesPerHour) * 60;
          } else {
            setCycleType('work');
            return metrics.maxContinuousWorkMinutes * 60;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, cycleType, metrics.restMinutesPerHour, metrics.maxContinuousWorkMinutes]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSoundBuzzer = () => {
    edgeAudio.playRestBreakAlert();
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-rose-400" />
            <h2 className="text-base font-bold text-white">
              Autonomous Worksite Rest-Break Enforcement System
            </h2>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
              OSHA / NIOSH Directives
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Eliminates human error. The Arduino UNO Q sounds the worksite siren autonomously when WBGT thresholds are breached, forcing mandatory rest and hydration.
          </p>
        </div>

        <button
          onClick={handleSoundBuzzer}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-lg shadow-orange-500/20 transition-all"
        >
          <Bell className="w-4 h-4" />
          <span>Sound Worksite Siren (Piezo Buzzer)</span>
        </button>
      </div>

      {/* Center Countdown & Action Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Countdown Timer Card */}
        <div className="lg:col-span-6 glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col items-center justify-between text-center">
          <div className="w-full flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                cycleType === 'work'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 animate-pulse'
              }`}
            >
              Current State: {cycleType === 'work' ? 'ACTIVE WORK CYCLE' : 'MANDATORY SHADE REST'}
            </span>

            <span className="text-xs font-mono text-slate-400">
              WBGT: <strong className="text-rose-400">{metrics.wbgtOutdoor}°C</strong>
            </span>
          </div>

          {/* Big Digital Countdown */}
          <div className="my-6">
            <div className="text-6xl md:text-7xl font-extrabold font-mono text-white tracking-tight tabular-nums">
              {formatTime(secondsRemaining)}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {cycleType === 'work'
                ? `Next mandatory rest break in ${Math.ceil(secondsRemaining / 60)} minutes`
                : 'Hydrate now. Stay inside misting kiosk / shaded shelter.'}
            </p>
          </div>

          {/* Controls Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors border border-slate-700"
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isRunning ? 'Pause Timer' : 'Resume'}</span>
            </button>
            <button
              onClick={() => {
                setCycleType('work');
                setSecondsRemaining(metrics.maxContinuousWorkMinutes * 60);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Cycle</span>
            </button>
          </div>
        </div>

        {/* Hydration & Worksite Log */}
        <div className="lg:col-span-6 glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Mandatory Hydration Log</h3>
              </div>
              <span className="text-xs text-cyan-400 font-mono font-bold">
                Goal: {metrics.recommendedWaterPerHourMl} ml/hr
              </span>
            </div>

            {/* Hydration Progress Bar */}
            <div className="bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800 mb-2">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (waterLoggedMl / metrics.recommendedWaterPerHourMl) * 100)}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Consumed: <strong className="text-white font-mono">{waterLoggedMl} ml</strong></span>
              <span>Remaining: <strong className="text-cyan-300 font-mono">{Math.max(0, metrics.recommendedWaterPerHourMl - waterLoggedMl)} ml</strong></span>
            </div>

            {/* Quick Log Buttons */}
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => setWaterLoggedMl((w) => w + 250)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors text-center"
              >
                +250 ml (1 Cup)
              </button>
              <button
                onClick={() => setWaterLoggedMl((w) => w + 500)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors text-center"
              >
                +500 ml (Bottle)
              </button>
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-900/70 rounded-xl border border-slate-800 text-xs text-slate-300">
            <strong className="text-emerald-400">Relief Protocol: </strong>
            During rest cycles, Relay 2 triggers pulsed water micro-misting automatically for 45 seconds to lower skin temperature without soaking work clothes.
          </div>
        </div>
      </div>

      {/* ISO / NIOSH Reference Matrix */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          Automated Work-Rest Schedule Matrix (ISO 7243 / OSHA Standard)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2 px-3">WBGT Range</th>
                <th className="py-2 px-3">Risk Level</th>
                <th className="py-2 px-3">Work / Rest Ratio</th>
                <th className="py-2 px-3">Arduino UNO Q Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              <tr className={metrics.wbgtOutdoor < 28 ? 'bg-emerald-950/30 text-emerald-300 font-bold' : ''}>
                <td className="py-2.5 px-3">&lt; 28.0°C</td>
                <td className="py-2.5 px-3">Low</td>
                <td className="py-2.5 px-3">Continuous Work (Standard)</td>
                <td className="py-2.5 px-3 text-slate-400">Idle / Low-power sensing</td>
              </tr>
              <tr className={metrics.wbgtOutdoor >= 28 && metrics.wbgtOutdoor < 30 ? 'bg-amber-950/30 text-amber-300 font-bold' : ''}>
                <td className="py-2.5 px-3">28.0°C - 29.9°C</td>
                <td className="py-2.5 px-3">Caution</td>
                <td className="py-2.5 px-3">75% Work / 25% Rest (45m/15m)</td>
                <td className="py-2.5 px-3 text-amber-400">Chime 15m rest break</td>
              </tr>
              <tr className={metrics.wbgtOutdoor >= 30 && metrics.wbgtOutdoor < 32 ? 'bg-orange-950/30 text-orange-300 font-bold' : ''}>
                <td className="py-2.5 px-3">30.0°C - 31.9°C</td>
                <td className="py-2.5 px-3">High</td>
                <td className="py-2.5 px-3">50% Work / 50% Rest (30m/30m)</td>
                <td className="py-2.5 px-3 text-orange-400">Relay 1 Cooler + Siren</td>
              </tr>
              <tr className={metrics.wbgtOutdoor >= 32 ? 'bg-rose-950/40 text-rose-300 font-bold' : ''}>
                <td className="py-2.5 px-3">&ge; 32.0°C</td>
                <td className="py-2.5 px-3">Extreme Danger</td>
                <td className="py-2.5 px-3">25% Work / 75% Rest or STOP WORK</td>
                <td className="py-2.5 px-3 text-rose-400">Relay 1 + Relay 2 + Alarm pulse</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
