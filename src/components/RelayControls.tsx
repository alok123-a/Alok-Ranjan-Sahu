import React from 'react';
import { RelayStates } from '../types';
import {
  Fan,
  Droplets,
  Wind,
  Bell,
  Cpu,
  Power,
} from 'lucide-react';
import { edgeAudio } from '../services/audioBuzzer';

interface RelayControlsProps {
  relays: RelayStates;
  setRelays: React.Dispatch<React.SetStateAction<RelayStates>>;
  wbgt: number;
}

export const RelayControls: React.FC<RelayControlsProps> = ({
  relays,
  setRelays,
  wbgt,
}) => {
  const toggleRelay = (key: keyof Omit<RelayStates, 'autoControlEnabled'>) => {
    edgeAudio.playRelayClick();
    setRelays((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleAutoMode = () => {
    edgeAudio.playRelayClick();
    setRelays((prev) => ({
      ...prev,
      autoControlEnabled: !prev.autoControlEnabled,
    }));
  };

  return (
    <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Power className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-slate-200">
            Hardware Relays &amp; Autonomous Actuation
          </span>
        </div>

        {/* Autonomous Mode Toggle */}
        <button
          onClick={toggleAutoMode}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
            relays.autoControlEnabled
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
          title="When enabled, Arduino UNO Q executes relay actions autonomously without cloud delay"
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>{relays.autoControlEnabled ? 'Edge AI Auto: ACTIVE' : 'Manual Override'}</span>
        </button>
      </div>

      {/* Relays Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Relay 1: Evaporative Cooler */}
        <div
          onClick={() => toggleRelay('evaporativeCooler')}
          className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
            relays.evaporativeCooler
              ? 'bg-gradient-to-br from-cyan-950/60 to-blue-900/40 border-cyan-500/40 shadow-md shadow-cyan-500/10'
              : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div
              className={`p-2 rounded-lg ${
                relays.evaporativeCooler ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Fan
                className={`w-4 h-4 ${relays.evaporativeCooler ? 'animate-spin' : ''}`}
                style={{ animationDuration: '1.2s' }}
              />
            </div>
            {/* Toggle Pill */}
            <div
              className={`w-8 h-4 rounded-full p-0.5 transition-colors ${
                relays.evaporativeCooler ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full bg-white transition-transform ${
                  relays.evaporativeCooler ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-200 block">Relay 1: Cooler Fan</span>
            <span className="text-[10px] text-slate-400">
              {relays.evaporativeCooler ? 'Active · 240V AC' : 'Standby'}
            </span>
          </div>
        </div>

        {/* Relay 2: Misting Micro-Sprinkler */}
        <div
          onClick={() => toggleRelay('mistingSprinkler')}
          className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
            relays.mistingSprinkler
              ? 'bg-gradient-to-br from-emerald-950/60 to-teal-900/40 border-emerald-500/40 shadow-md shadow-emerald-500/10'
              : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div
              className={`p-2 rounded-lg ${
                relays.mistingSprinkler ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Droplets className="w-4 h-4" />
            </div>
            <div
              className={`w-8 h-4 rounded-full p-0.5 transition-colors ${
                relays.mistingSprinkler ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full bg-white transition-transform ${
                  relays.mistingSprinkler ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-200 block">Relay 2: Micro-Misting</span>
            <span className="text-[10px] text-slate-400">
              {relays.mistingSprinkler ? 'Spraying 45s cycle' : 'Idle'}
            </span>
          </div>
        </div>

        {/* Relay 3: Ventilation Louvers */}
        <div
          onClick={() => toggleRelay('ventilationLouvers')}
          className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
            relays.ventilationLouvers
              ? 'bg-gradient-to-br from-indigo-950/60 to-purple-900/40 border-indigo-500/40 shadow-md shadow-indigo-500/10'
              : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div
              className={`p-2 rounded-lg ${
                relays.ventilationLouvers ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Wind className="w-4 h-4" />
            </div>
            <div
              className={`w-8 h-4 rounded-full p-0.5 transition-colors ${
                relays.ventilationLouvers ? 'bg-indigo-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full bg-white transition-transform ${
                  relays.ventilationLouvers ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-200 block">Relay 3: Louvers Servo</span>
            <span className="text-[10px] text-slate-400">
              {relays.ventilationLouvers ? 'Open 100% (Exhaust)' : 'Closed'}
            </span>
          </div>
        </div>

        {/* Relay 4: Rest-Break Worksite Buzzer */}
        <div
          onClick={() => toggleRelay('restBreakBuzzer')}
          className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
            relays.restBreakBuzzer
              ? 'bg-gradient-to-br from-rose-950/60 to-amber-900/40 border-rose-500/40 shadow-md shadow-rose-500/10 animate-pulse'
              : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div
              className={`p-2 rounded-lg ${
                relays.restBreakBuzzer ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Bell className="w-4 h-4" />
            </div>
            <div
              className={`w-8 h-4 rounded-full p-0.5 transition-colors ${
                relays.restBreakBuzzer ? 'bg-rose-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full bg-white transition-transform ${
                  relays.restBreakBuzzer ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-200 block">Relay 4: Rest Siren</span>
            <span className="text-[10px] text-slate-400">
              {relays.restBreakBuzzer ? 'ALARM ACTIVE (Rest)' : 'Silent'}
            </span>
          </div>
        </div>
      </div>

      {/* Edge Decision Status Bar */}
      <div className="mt-3 bg-slate-900/90 rounded-xl px-3 py-2 border border-slate-800/80 flex items-center justify-between text-xs">
        <span className="text-slate-400">Autonomous Edge Trigger:</span>
        <span
          className={`font-mono font-semibold ${
            wbgt >= 32.0 ? 'text-rose-400' : wbgt >= 30.0 ? 'text-amber-400' : 'text-emerald-400'
          }`}
        >
          {wbgt >= 32.0
            ? 'WBGT >= 32°C -> Full Relief Triggered'
            : wbgt >= 30.0
            ? 'WBGT >= 30°C -> Moderate Fan Cooling'
            : 'Nominal -> Low Power Idle'}
        </span>
      </div>
    </div>
  );
};
