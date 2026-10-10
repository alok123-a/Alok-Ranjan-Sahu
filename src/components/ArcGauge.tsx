import React from 'react';

interface ArcGaugeProps {
  value: number;
  min: number;
  max: number;
  label: string;
  unit?: string;
  subtitle?: string;
  colorScheme?: 'orange' | 'emerald' | 'cyan' | 'rose';
  onIncrement?: () => void;
  onDecrement?: () => void;
  targetValue?: number;
}

export const ArcGauge: React.FC<ArcGaugeProps> = ({
  value,
  min,
  max,
  label,
  unit = '°C',
  subtitle,
  colorScheme = 'orange',
  onIncrement,
  onDecrement,
  targetValue,
}) => {
  // Semi-circle arc geometry: 180 degrees arc (from 180 to 0 deg)
  const radius = 75;
  const strokeWidth = 12;
  const center = 95;
  const clamped = Math.min(max, Math.max(min, value));
  const percentage = (clamped - min) / (max - min);

  // Circumference of semi-circle = PI * r
  const arcLength = Math.PI * radius;
  const strokeDashoffset = arcLength * (1 - percentage);

  const gradients = {
    orange: {
      from: '#f97316',
      to: '#ef4444',
      glow: 'rgba(249, 115, 22, 0.4)',
      bg: 'from-amber-950/20 to-orange-950/30',
      border: 'border-orange-500/20',
      badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    },
    emerald: {
      from: '#10b981',
      to: '#06b6d4',
      glow: 'rgba(16, 185, 129, 0.4)',
      bg: 'from-emerald-950/20 to-teal-950/30',
      border: 'border-emerald-500/20',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    cyan: {
      from: '#06b6d4',
      to: '#3b82f6',
      glow: 'rgba(6, 182, 212, 0.4)',
      bg: 'from-cyan-950/20 to-blue-950/30',
      border: 'border-cyan-500/20',
      badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    },
    rose: {
      from: '#f43f5e',
      to: '#e11d48',
      glow: 'rgba(244, 63, 94, 0.4)',
      bg: 'from-rose-950/20 to-red-950/30',
      border: 'border-rose-500/20',
      badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    },
  };

  const scheme = gradients[colorScheme];

  return (
    <div
      className={`glass-panel rounded-2xl p-4 flex flex-col justify-between border ${scheme.border} bg-gradient-to-b ${scheme.bg} relative overflow-hidden`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between z-10">
        <span className="text-xs font-semibold text-slate-300">{label}</span>
        {subtitle && (
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${scheme.badge}`}>
            {subtitle}
          </span>
        )}
      </div>

      {/* SVG Arc Display */}
      <div className="relative flex items-center justify-center my-1">
        <svg width="190" height="115" viewBox="0 0 190 115" className="overflow-visible">
          <defs>
            <linearGradient id={`arc-grad-${colorScheme}`} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={scheme.from} />
              <stop offset="100%" stopColor={scheme.to} />
            </linearGradient>
            <filter id={`glow-${colorScheme}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={scheme.glow} />
            </filter>
          </defs>

          {/* Background Track Arc */}
          <path
            d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Active Gradient Value Arc */}
          <path
            d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
            fill="none"
            stroke={`url(#arc-grad-${colorScheme})`}
            strokeWidth={strokeWidth}
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            filter={`url(#glow-${colorScheme})`}
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Value Text */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-center text-center">
          <div className="flex items-baseline justify-center">
            <span className="text-2xl font-bold tracking-tight text-white font-mono tabular-nums">
              {value.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 ml-0.5 font-medium">{unit}</span>
          </div>
          {targetValue !== undefined && (
            <span className="text-[10px] text-slate-400">Target: {targetValue}°C</span>
          )}
        </div>
      </div>

      {/* Interactive Controls (+ / -) if provided */}
      {(onIncrement || onDecrement) && (
        <div className="flex items-center justify-between pt-1 z-10">
          <button
            onClick={onDecrement}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold border border-slate-700/60 transition-colors"
            title="Decrease relief setpoint"
          >
            -
          </button>
          <span className="text-[11px] text-slate-400 font-medium">Relief Threshold</span>
          <button
            onClick={onIncrement}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold border border-slate-700/60 transition-colors"
            title="Increase relief setpoint"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
};
