import React from 'react';
import { SensorReadings, HeatStressMetrics } from '../types';
import {
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Flame,
  Activity,
  Sliders,
  RotateCcw,
} from 'lucide-react';

interface SensorsTelemetryViewProps {
  readings: SensorReadings;
  setReadings: React.Dispatch<React.SetStateAction<SensorReadings>>;
  metrics: HeatStressMetrics;
  onTriggerExtremeAlert?: () => void;
}

export const SensorsTelemetryView: React.FC<SensorsTelemetryViewProps> = ({
  readings,
  setReadings,
  metrics,
  onTriggerExtremeAlert,
}) => {
  const resetToDefault = () => {
    setReadings({
      ambientTemp: 38.5,
      relativeHumidity: 64,
      blackGlobeTemp: 45.2,
      windSpeed: 0.8,
      solarIrradiance: 840,
      roofSurfaceTemp: 52.6,
      airQualityVOC: 88,
      co2EquivPpm: 520,
    });
  };

  const simulateExtremeHeatwave = () => {
    setReadings({
      ambientTemp: 44.5,
      relativeHumidity: 72,
      blackGlobeTemp: 54.0,
      windSpeed: 0.4,
      solarIrradiance: 1050,
      roofSurfaceTemp: 62.5,
      airQualityVOC: 195,
      co2EquivPpm: 820,
    });
    if (onTriggerExtremeAlert) {
      onTriggerExtremeAlert();
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Info Banner */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            Sensor Telemetry &amp; Physical Microclimate Controls
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Adjust physical sensors to simulate extreme heatwave conditions. All indices are computed locally on Arduino UNO Q without cloud dependency.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={simulateExtremeHeatwave}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-all shadow-sm"
            title="Simulate 44.5°C extreme heatwave to test the warning alert toast and audio siren"
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>Simulate Extreme Spike (Alert)</span>
          </button>
          <button
            onClick={resetToDefault}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Sensors</span>
          </button>
        </div>
      </div>

      {/* Interactive Sensor Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Air Temperature Ta (SHT41) */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-rose-400" />
              Air Temperature ($T_a$)
            </span>
            <span className="text-base font-bold font-mono text-rose-400">
              {readings.ambientTemp}°C
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Sensirion SHT41 I2C Precision Sensor</p>
          <input
            type="range"
            min="25"
            max="50"
            step="0.1"
            value={readings.ambientTemp}
            onChange={(e) =>
              setReadings((prev) => ({ ...prev, ambientTemp: parseFloat(e.target.value) }))
            }
            className="w-full accent-rose-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>25°C (Cool)</span>
            <span>38°C (Typical Peak)</span>
            <span>50°C (Extreme)</span>
          </div>
        </div>

        {/* 2. Relative Humidity RH (SHT41 / BME688) */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-cyan-400" />
              Relative Humidity (RH)
            </span>
            <span className="text-base font-bold font-mono text-cyan-400">
              {readings.relativeHumidity}%
            </span>
          </div>
          <p className="text-[11px] text-slate-400">High humidity suppresses evaporative sweat cooling</p>
          <input
            type="range"
            min="15"
            max="95"
            step="1"
            value={readings.relativeHumidity}
            onChange={(e) =>
              setReadings((prev) => ({ ...prev, relativeHumidity: parseInt(e.target.value) }))
            }
            className="w-full accent-cyan-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>15% (Dry)</span>
            <span>60% (Coastal India)</span>
            <span>95% (Monsoon)</span>
          </div>
        </div>

        {/* 3. Black Globe Temp Tg (DS18B20 inside matte black globe) */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500" />
              Black Globe Radiant ($T_g$)
            </span>
            <span className="text-base font-bold font-mono text-amber-400">
              {readings.blackGlobeTemp}°C
            </span>
          </div>
          <p className="text-[11px] text-slate-400">DS18B20 in 150mm matte globe measures solar radiation</p>
          <input
            type="range"
            min="25"
            max="60"
            step="0.2"
            value={readings.blackGlobeTemp}
            onChange={(e) =>
              setReadings((prev) => ({ ...prev, blackGlobeTemp: parseFloat(e.target.value) }))
            }
            className="w-full accent-amber-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>25°C (Shaded)</span>
            <span>45°C (Radiant Sun)</span>
            <span>60°C (Hot Roof)</span>
          </div>
        </div>

        {/* 4. Wind Velocity (Anemometer) */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-emerald-400" />
              Air Velocity ($v$)
            </span>
            <span className="text-base font-bold font-mono text-emerald-400">
              {readings.windSpeed} m/s
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Hot-wire / Cup anemometer on Analog pin A0</p>
          <input
            type="range"
            min="0.1"
            max="12.0"
            step="0.1"
            value={readings.windSpeed}
            onChange={(e) =>
              setReadings((prev) => ({ ...prev, windSpeed: parseFloat(e.target.value) }))
            }
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>0.1 m/s (Stagnant)</span>
            <span>1.5 m/s (Breeze)</span>
            <span>12 m/s (Gale)</span>
          </div>
        </div>

        {/* 5. Solar Irradiance (Pyranometer/Lux) */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-yellow-400" />
              Solar Irradiance ($SR$)
            </span>
            <span className="text-base font-bold font-mono text-yellow-400">
              {readings.solarIrradiance} W/m²
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Calibrated photodiode / Lux sensor for solar load</p>
          <input
            type="range"
            min="0"
            max="1200"
            step="20"
            value={readings.solarIrradiance}
            onChange={(e) =>
              setReadings((prev) => ({ ...prev, solarIrradiance: parseInt(e.target.value) }))
            }
            className="w-full accent-yellow-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>0 (Night)</span>
            <span>600 (Filtered)</span>
            <span>1200 (Blazing Sun)</span>
          </div>
        </div>

        {/* 6. Roof Surface Temp (MLX90640) */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-purple-400" />
              Roof Surface (T_roof)
            </span>
            <span className="text-base font-bold font-mono text-purple-400">
              {readings.roofSurfaceTemp}°C
            </span>
          </div>
          <p className="text-[11px] text-slate-400">MLX90640 32x24 Far-Infrared Thermopile Array</p>
          <input
            type="range"
            min="30"
            max="65"
            step="0.5"
            value={readings.roofSurfaceTemp}
            onChange={(e) =>
              setReadings((prev) => ({ ...prev, roofSurfaceTemp: parseFloat(e.target.value) }))
            }
            className="w-full accent-purple-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>30°C (Insulated)</span>
            <span>48°C (Concrete)</span>
            <span>65°C (Corrugated Tin)</span>
          </div>
        </div>
      </div>

      {/* Physics Deep Dive Comparison Card: Why Raw Temp is Deceptive */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-3">
          Hyperlocal Microclimate Reality vs. District Government Weather Station
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Official District Average</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-slate-200">36.0°C</span>
              <span className="text-xs text-slate-400">Ambient</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              Standard IMD weather stations sit in open grass fields with shade louvers. Fails to report real rooftop room heat stress.
            </p>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-amber-500/40">
            <span className="text-xs text-amber-300 font-semibold block mb-1">
              Tin-Roof Room Reality (Local)
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-amber-400">{readings.ambientTemp}°C</span>
              <span className="text-xs text-amber-300 font-semibold">(+{(readings.ambientTemp - 36).toFixed(1)}°C Gap)</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              Corrugated tin sheets absorb 88% solar radiation, superheating the ceiling to{' '}
              <strong className="text-rose-300 font-mono">{readings.roofSurfaceTemp}°C</strong>.
            </p>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-rose-500/40">
            <span className="text-xs text-rose-300 font-semibold block mb-1">
              Real WBGT Heat Strain
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-rose-400">{metrics.wbgtOutdoor}°C</span>
              <span className="text-xs text-rose-300 font-semibold">(HI: {metrics.heatIndex}°C)</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              Combines radiant sun load, air stillness, and humidity. At {metrics.wbgtOutdoor}°C, sweat cannot evaporate, triggering acute heatstroke risk.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
