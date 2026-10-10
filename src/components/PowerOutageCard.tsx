import React from 'react';
import { PowerSystemState } from '../types';
import {
  BatteryCharging,
  Sun,
  Zap,
  ZapOff,
  Database,
  Cpu,
} from 'lucide-react';

interface PowerOutageCardProps {
  powerState: PowerSystemState;
  setPowerState: React.Dispatch<React.SetStateAction<PowerSystemState>>;
}

export const PowerOutageCard: React.FC<PowerOutageCardProps> = ({
  powerState,
  setPowerState,
}) => {
  const toggleGrid = () => {
    setPowerState((prev) => ({
      ...prev,
      gridConnected: !prev.gridConnected,
      loadWatts: !prev.gridConnected ? 14.5 : 9.8,
    }));
  };

  return (
    <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BatteryCharging className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-200">
            Solar + LiFePO4 Outage Resilience
          </span>
        </div>
        <button
          onClick={toggleGrid}
          className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-all ${
            powerState.gridConnected
              ? 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              : 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
          }`}
          title="Simulate city blackout / power cut"
        >
          {powerState.gridConnected ? 'Simulate Blackout' : 'Restore Grid'}
        </button>
      </div>

      {/* Grid Status Banner */}
      <div
        className={`p-3 rounded-xl border mb-3 flex items-center justify-between ${
          powerState.gridConnected
            ? 'bg-slate-900/60 border-slate-800 text-slate-300'
            : 'bg-gradient-to-r from-rose-950/70 via-amber-950/50 to-slate-900 border-rose-500/40 text-amber-200'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-lg ${
              powerState.gridConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/30 text-rose-400'
            }`}
          >
            {powerState.gridConnected ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
          </div>
          <div>
            <span className="text-xs font-bold block">
              {powerState.gridConnected ? 'Municipal Grid: ONLINE' : 'GRID COLLAPSED / POWER CUT ACTIVE'}
            </span>
            <span className="text-[10px] text-slate-400">
              {powerState.gridConnected
                ? 'Trickle charging LiFePO4 cells'
                : 'Node survives autonomously on 12.8V LiFePO4 + Solar'}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase text-slate-400 block">Outage Autonomy</span>
          <span className="text-base font-bold font-mono text-emerald-400">
            {powerState.estimatedRuntimeHours} hrs
          </span>
        </div>
      </div>

      {/* Subsystem Metrics Grid */}
      <div className="grid grid-cols-4 gap-2 text-center">
        {/* LiFePO4 SoC */}
        <div className="bg-slate-900/80 rounded-xl p-2 border border-slate-800/80">
          <span className="text-[10px] text-slate-400 block">Battery (LiFePO4)</span>
          <span className="text-sm font-bold font-mono text-emerald-400">
            {powerState.batterySoC}%
          </span>
          <span className="text-[9px] text-slate-500 block">{powerState.batteryVoltage}V (4S)</span>
        </div>

        {/* Solar Generation */}
        <div className="bg-slate-900/80 rounded-xl p-2 border border-slate-800/80">
          <span className="text-[10px] text-slate-400 block flex items-center justify-center gap-0.5">
            <Sun className="w-2.5 h-2.5 text-amber-400" /> Solar W
          </span>
          <span className="text-sm font-bold font-mono text-amber-400">
            {powerState.solarWatts} W
          </span>
          <span className="text-[9px] text-slate-500 block">Mono-PERC</span>
        </div>

        {/* Load Consumption */}
        <div className="bg-slate-900/80 rounded-xl p-2 border border-slate-800/80">
          <span className="text-[10px] text-slate-400 block">Total Load</span>
          <span className="text-sm font-bold font-mono text-cyan-400">
            {powerState.loadWatts} W
          </span>
          <span className="text-[9px] text-slate-500 block">Dual Core + Relays</span>
        </div>

        {/* Offline Cache Packets */}
        <div className="bg-slate-900/80 rounded-xl p-2 border border-slate-800/80">
          <span className="text-[10px] text-slate-400 block flex items-center justify-center gap-0.5">
            <Database className="w-2.5 h-2.5 text-indigo-400" /> Offline Buffer
          </span>
          <span className="text-sm font-bold font-mono text-indigo-400">
            {powerState.cachedOfflinePackets}
          </span>
          <span className="text-[9px] text-slate-500 block">Flash Cached</span>
        </div>
      </div>

      {/* Hardware Deep Sleep Indicator */}
      <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-slate-400" />
          <span>STM32U585 Deep-Sleep Cycle:</span>
        </span>
        <span className="font-mono text-emerald-400">
          1950ms Sleep / 50ms Active (Duty: 2.5%)
        </span>
      </div>
    </div>
  );
};
