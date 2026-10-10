import React, { useState } from 'react';
import { Eye, Flame, Maximize2, ShieldAlert } from 'lucide-react';

interface ThermalCameraMatrixProps {
  maxRoofTemp: number;
  ambientTemp: number;
  roomName: string;
}

export const ThermalCameraMatrix: React.FC<ThermalCameraMatrixProps> = ({
  maxRoofTemp,
  ambientTemp,
  roomName,
}) => {
  const [selectedPixel, setSelectedPixel] = useState<{ x: number; y: number; temp: number } | null>(
    null
  );
  const [viewMode, setViewMode] = useState<'thermal' | 'schematic'>('thermal');

  // Matrix dimensions: MLX90640 is 32x24
  const cols = 24;
  const rows = 16; // scaled representation for clean responsive rendering

  // Generate synthetic thermal gradient matrix centered around roof hotspot
  const pixels = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Hot spot near top (representing ceiling / tin roof)
      const roofDistance = r / (rows - 1); // 0 at top, 1 at bottom
      const centerDist = Math.abs(c - cols / 2) / (cols / 2);
      
      // Interpolate between roof max temp and floor cooler temp
      const noise = ((r * 13 + c * 7) % 10) * 0.15 - 0.75;
      const t = maxRoofTemp - roofDistance * (maxRoofTemp - ambientTemp + 4.5) - centerDist * 1.8 + noise;
      pixels.push({ r, c, temp: Number(Math.max(ambientTemp - 3, t).toFixed(1)) });
    }
  }

  // Ironbow thermal color map
  const getIronbowColor = (temp: number) => {
    const minT = ambientTemp - 4;
    const maxT = maxRoofTemp + 2;
    const norm = Math.max(0, Math.min(1, (temp - minT) / (maxT - minT)));

    if (norm < 0.25) {
      // Deep blue to purple
      const f = norm / 0.25;
      return `rgb(${Math.round(20 * f)}, ${Math.round(20 + 40 * f)}, ${Math.round(120 + 80 * f)})`;
    } else if (norm < 0.5) {
      // Purple to orange
      const f = (norm - 0.25) / 0.25;
      return `rgb(${Math.round(120 + 100 * f)}, ${Math.round(30 + 70 * f)}, ${Math.round(180 - 150 * f)})`;
    } else if (norm < 0.75) {
      // Orange to bright amber
      const f = (norm - 0.5) / 0.25;
      return `rgb(240, ${Math.round(100 + 100 * f)}, 10)`;
    } else {
      // Amber to white hot
      const f = (norm - 0.75) / 0.25;
      return `rgb(${Math.round(240 + 15 * f)}, ${Math.round(200 + 55 * f)}, ${Math.round(50 + 205 * f)})`;
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between border border-slate-800 relative overflow-hidden h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-400" />
          <span className="text-xs font-semibold text-slate-200">
            MLX90640 Thermal IR Array (32×24)
          </span>
          <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/30">
            Peak: {maxRoofTemp}°C
          </span>
        </div>

        <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[11px]">
          <button
            onClick={() => setViewMode('thermal')}
            className={`px-2 py-0.5 rounded transition-colors ${
              viewMode === 'thermal'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Thermal Vision
          </button>
          <button
            onClick={() => setViewMode('schematic')}
            className={`px-2 py-0.5 rounded transition-colors ${
              viewMode === 'schematic'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Room Schematic
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'thermal' ? (
        <div className="relative rounded-xl overflow-hidden border border-slate-800/90 bg-black aspect-[16/10] flex items-center justify-center p-1">
          <div
            className="w-full h-full grid gap-[1.5px]"
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
            }}
          >
            {pixels.map((p, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setSelectedPixel({ x: p.c, y: p.r, temp: p.temp })}
                onClick={() => setSelectedPixel({ x: p.c, y: p.r, temp: p.temp })}
                className="w-full h-full rounded-[1px] transition-transform hover:scale-125 cursor-crosshair hover:z-20"
                style={{ backgroundColor: getIronbowColor(p.temp) }}
                title={`Pixel (${p.c}, ${p.r}): ${p.temp}°C`}
              />
            ))}
          </div>

          {/* Overlay Hotspot Indicator */}
          <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-sm border border-slate-700/60 rounded px-2 py-1 text-[11px] font-mono text-slate-300">
            <span className="text-rose-400 font-bold">ROOF HOTSPOT: </span>
            <span className="font-bold text-white">{maxRoofTemp}°C</span> (Tin Sheet Radiant Trapping)
          </div>

          {selectedPixel && (
            <div className="absolute bottom-2 right-2 bg-slate-950/90 border border-amber-500/50 rounded px-2.5 py-1 text-[11px] font-mono text-amber-300 shadow-lg">
              Coord: [{selectedPixel.x},{selectedPixel.y}] · {selectedPixel.temp}°C
            </div>
          )}

          {/* Legend scale */}
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] text-slate-400">
            <span>{ambientTemp - 3}°C</span>
            <div
              className="w-16 h-2 rounded-full"
              style={{
                background: 'linear-gradient(to right, rgb(20,20,120), rgb(180,30,120), rgb(240,120,10), rgb(255,255,255))',
              }}
            />
            <span className="text-rose-300 font-semibold">{maxRoofTemp}°C</span>
          </div>
        </div>
      ) : (
        /* Schematic View showing physical layout & sensors */
        <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-[#070b14] aspect-[16/10] p-4 flex flex-col justify-between">
          <div className="border-b-2 border-dashed border-rose-500/70 pb-2 flex items-center justify-between text-xs">
            <span className="font-bold text-rose-400 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> Tin Corrugated Roof (Surface: {maxRoofTemp}°C)
            </span>
            <span className="text-[10px] text-slate-400">Thermal Gap: +{(maxRoofTemp - ambientTemp).toFixed(1)}°C</span>
          </div>

          <div className="flex-1 my-2 flex items-center justify-around text-center">
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2 text-xs">
              <span className="text-slate-400 block text-[10px]">DS18B20 Black Globe</span>
              <span className="font-bold text-amber-400 font-mono">Radiant Temp Sensor</span>
            </div>
            <div className="bg-slate-900/90 border border-amber-500/40 rounded-lg p-2 text-xs">
              <span className="text-amber-300 block text-[10px]">Arduino UNO Q Core</span>
              <span className="font-bold text-white font-mono">Autonomous Node</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2 text-xs">
              <span className="text-slate-400 block text-[10px]">Relay 1 Actuator</span>
              <span className="font-bold text-cyan-400 font-mono">Misting / Evap Cooler</span>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-1 text-[11px] text-slate-400 flex justify-between">
            <span>Location: {roomName}</span>
            <span className="text-emerald-400 font-mono">Local Decisions: 100% On-Board</span>
          </div>
        </div>
      )}

      {/* Caption note */}
      <p className="text-[11px] text-slate-400 mt-2">
        Real heat stress is felt inside tin-roof rooms sitting 10°C+ above official city thermometers. The MLX90640 detects rooftop radiant trapping to fire anticipatory cooling.
      </p>
    </div>
  );
};
