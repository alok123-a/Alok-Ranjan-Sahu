import React from 'react';
import { PowerSystemState } from '../types';
import {
  BatteryCharging,
  Zap,
  ZapOff,
  Cpu,
  Sun,
  ShieldCheck,
  HardDrive,
  Activity,
  Layers,
} from 'lucide-react';

interface PowerOutageResilienceViewProps {
  powerState: PowerSystemState;
  setPowerState: React.Dispatch<React.SetStateAction<PowerSystemState>>;
}

export const PowerOutageResilienceView: React.FC<PowerOutageResilienceViewProps> = ({
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
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BatteryCharging className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">
              Hardware Power &amp; Grid Failure Survival Architecture
            </h2>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              LiFePO4 + Solar
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            In India, peak heatwaves coincide with power grid collapses due to overloaded air-conditioning transformers. ThermaEdge UNO Q is engineered to never shut down.
          </p>
        </div>

        <button
          onClick={toggleGrid}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
            powerState.gridConnected
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30 animate-pulse'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
          }`}
        >
          {powerState.gridConnected ? (
            <>
              <ZapOff className="w-4 h-4 text-rose-400" />
              <span>Simulate City Grid Collapse (Outage)</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Restore Municipal Grid Power</span>
            </>
          )}
        </button>
      </div>

      {/* Dual Core Hardware Architecture Card */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          Arduino UNO Q Dual-Core Power Partitioning
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Subsystem 1: Dragonwing Linux */}
          <div className="bg-slate-900/90 rounded-xl p-4 border border-cyan-500/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-cyan-300">
                  Qualcomm Dragonwing QRB2210 Linux
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                  Cortex-A53 Cores
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Runs heavy edge AI tasks: quantized TFLite LSTM predictions, WBGT math regressions, and anomaly detector. Once inferences complete, Linux cores drop into low-power idle sleep to conserve LiFePO4 battery reserve.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-xs text-slate-400">
              <span>Active Burst: <strong className="text-cyan-300 font-mono">1.8W (85ms)</strong></span>
              <span>Sleep Idle: <strong className="text-slate-200 font-mono">0.15W</strong></span>
            </div>
          </div>

          {/* Subsystem 2: STM32U585 Microcontroller */}
          <div className="bg-slate-900/90 rounded-xl p-4 border border-emerald-500/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-300">
                  STM32U585 Ultra-Low-Power MCU
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  Cortex-M33 TrustZone
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Manages continuous 24/7 ADC sensor sampling (SHT41, DS18B20, Anemometer), hardware watchdog, solar MPPT battery charging, and drives the 4 high-voltage relay coils directly with deep-sleep standby cycles.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-xs text-slate-400">
              <span>Sleep Current: <strong className="text-emerald-300 font-mono">0.4 mA</strong></span>
              <span>Hardware Watchdog: <strong className="text-emerald-300 font-mono">Always Active</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Battery & Solar Generation Subsystem */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* LiFePO4 Cell Status */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300">LiFePO4 Chemistry (4S)</span>
            <span className="text-xs font-mono font-bold text-emerald-400">{powerState.batterySoC}%</span>
          </div>

          <div className="my-3">
            <div className="bg-slate-900 rounded-full h-3.5 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all"
                style={{ width: `${powerState.batterySoC}%` }}
              />
            </div>
          </div>

          <div className="text-xs text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Pack Voltage:</span>
              <span className="text-white font-mono font-bold">{powerState.batteryVoltage} V</span>
            </div>
            <div className="flex justify-between">
              <span>High Temperature Tolerance:</span>
              <span className="text-emerald-400 font-bold">Up to 65°C safe</span>
            </div>
            <div className="flex justify-between">
              <span>Cycle Life:</span>
              <span className="text-slate-300 font-mono">&gt; 3,500 Cycles</span>
            </div>
          </div>
        </div>

        {/* Solar Generation */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300">Mono-PERC Solar Panel</span>
            <span className="text-xs font-mono font-bold text-amber-400">{powerState.solarWatts} W</span>
          </div>

          <div className="my-2 p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block">Current Solar Inflow</span>
            <span className="text-2xl font-bold font-mono text-amber-300">
              +{powerState.solarWatts} W
            </span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">Net Energy Surplus</span>
          </div>

          <div className="text-xs text-slate-400 flex justify-between">
            <span>MPPT Efficiency:</span>
            <span className="text-white font-mono">98.4%</span>
          </div>
        </div>

        {/* Offline Telemetry Buffer */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300">Offline Flash Buffer</span>
            <span className="text-xs font-mono font-bold text-indigo-400">
              {powerState.cachedOfflinePackets} Packets
            </span>
          </div>

          <div className="my-2 p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block">Local Edge Autonomy</span>
            <span className="text-lg font-bold font-mono text-white">
              {powerState.gridConnected ? 'Sync Stream Active' : 'Zero Cloud Loss Mode'}
            </span>
            <span className="text-[10px] text-indigo-300 block mt-0.5">
              NOR Flash Memory Cached
            </span>
          </div>

          <div className="text-xs text-slate-400 flex justify-between">
            <span>Opportunistic Sync:</span>
            <span className="text-emerald-400 font-semibold">Ready for 4G/LoRa</span>
          </div>
        </div>
      </div>
    </div>
  );
};
