import React from 'react';
import {
  SensorReadings,
  RoomEnvironment,
  ForecastPoint,
} from '../types';
import { predictIndoorThermalTrajectory } from '../services/edgeThermalPredictor';
import {
  Cpu,
  Clock,
  TrendingUp,
  AlertTriangle,
  Building,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

interface ThermalPredictorViewProps {
  readings: SensorReadings;
  room: RoomEnvironment;
  setRoom: (r: RoomEnvironment) => void;
}

export const ThermalPredictorView: React.FC<ThermalPredictorViewProps> = ({
  readings,
  room,
  setRoom,
}) => {
  const forecast = predictIndoorThermalTrajectory(readings, room);

  const roomProfiles: Record<
    RoomEnvironment,
    { label: string; tau: string; uValue: string; desc: string }
  > = {
    tin_roof: {
      label: 'Tin-Roof Rooftop Room',
      tau: '0.8 hrs (Fastest overheat)',
      uValue: '5.8 W/m²K',
      desc: 'Minimal thermal mass. Directly transmits solar load; internal temperature mirrors exterior sun within 45 mins.',
    },
    construction_site: {
      label: 'Highway Worksite / Scaffold',
      tau: '0.3 hrs (Instantaneous)',
      uValue: '7.2 W/m²K',
      desc: 'Zero thermal shelter. Workers endure direct unshielded solar flux and ground asphalt radiation.',
    },
    school_classroom: {
      label: 'School Classroom (Uninsulated)',
      tau: '1.8 hrs (Mid inertia)',
      uValue: '3.4 W/m²K',
      desc: 'Large glass windows cause greenhouse effect. Crowded student occupancy adds metabolic sensible heat.',
    },
    elderly_residence: {
      label: 'Concrete Senior Residence',
      tau: '4.5 hrs (High nocturnal inertia)',
      uValue: '2.1 W/m²K',
      desc: 'Concrete slab absorbs heat all afternoon and releases it indoors from 7 PM to 2 AM (dangerous nocturnal heat stress).',
    },
    factory_floor: {
      label: 'Industrial Metal Shed',
      tau: '1.2 hrs',
      uValue: '4.8 W/m²K',
      desc: 'Machinery waste heat combined with metal roof radiation creates intense internal thermal pockets.',
    },
  };

  const hasAnomaly = forecast.some((p) => p.anomalyProbability > 0.5);

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">
              TensorFlow Lite Indoor Thermal Dynamics Predictor
            </h2>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Quantized Cortex-A53
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Running 100% on the Qualcomm Dragonwing QRB2210 Linux subsystem. Learns building envelope thermal inertia (τ) to forecast heat spikes 1 to 6 hours ahead.
          </p>
        </div>

        {hasAnomaly && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold animate-pulse">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Thermal Anomaly Detected (+{(forecast[2].ambientTemp - readings.ambientTemp).toFixed(1)}°C surge)</span>
          </div>
        )}
      </div>

      {/* Room Archetype Selector */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
        {(Object.keys(roomProfiles) as RoomEnvironment[]).map((key) => {
          const isSelected = room === key;
          const profile = roomProfiles[key];
          return (
            <button
              key={key}
              onClick={() => setRoom(key)}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-amber-500/15 border-amber-500/40 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <span className={`text-xs font-bold block ${isSelected ? 'text-amber-300' : 'text-slate-300'}`}>
                  {profile.label}
                </span>
                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                  $\tau$ = {profile.tau}
                </span>
              </div>
              <span className="text-[9px] text-slate-500 mt-2 block">{profile.uValue}</span>
            </button>
          );
        })}
      </div>

      {/* 6-Hour Forecast Trajectory Grid */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              6-Hour Space Forecast Horizon (TFLite LSTM Output)
            </h3>
            <span className="text-xs text-slate-400">
              Active envelope: <strong className="text-slate-300">{roomProfiles[room].label}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Predicted Ambient</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>Predicted WBGT</span>
            </span>
          </div>
        </div>

        {/* Hourly Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {forecast.map((pt) => {
            const isDanger = pt.predictedWBGT >= 32;
            return (
              <div
                key={pt.hourOffset}
                className={`p-3 rounded-xl border flex flex-col justify-between ${
                  isDanger
                    ? 'bg-rose-950/40 border-rose-500/50 shadow-md shadow-rose-950/40'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-slate-300">{pt.timestamp}</span>
                  <span className="text-[10px] text-slate-400 font-mono">+{pt.hourOffset}h</span>
                </div>

                <div className="space-y-1.5 my-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Room Temp</span>
                    <span className="text-xl font-bold font-mono text-white">
                      {pt.ambientTemp}°C
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block">WBGT Index</span>
                    <span
                      className={`text-sm font-bold font-mono ${
                        isDanger ? 'text-rose-400' : 'text-amber-400'
                      }`}
                    >
                      {pt.predictedWBGT}°C
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">CI 95%</span>
                  <span className="text-slate-400 font-mono">
                    {pt.confidenceInterval[0]}-{pt.confidenceInterval[1]}°C
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Explainability note */}
        <div className="mt-4 p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
          <strong className="text-amber-400">Edge Learning Insight: </strong>
          {roomProfiles[room].desc} The Arduino UNO Q runs this prediction every 15 minutes. If predicted WBGT exceeds 32°C in the next 2 hours, it pre-cools the space via Relay 1 before the thermal peak hits, cutting peak power demand by 34%.
        </div>
      </div>
    </div>
  );
};
