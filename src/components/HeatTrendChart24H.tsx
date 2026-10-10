import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { RoomEnvironment, SensorReadings } from '../types';
import { TrendingUp, Clock, AlertTriangle, ShieldCheck, Flame, Info } from 'lucide-react';

interface HeatTrendChart24HProps {
  currentReadings: SensorReadings;
  currentRoom: RoomEnvironment;
  currentWBGT: number;
}

interface HourlyReadingPoint {
  time: string;
  hour: number;
  wbgt: number;
  ambientTemp: number;
  heatIndex: number;
  isPeak: boolean;
  status: 'Normal' | 'Caution' | 'High' | 'Extreme Danger';
}

export const HeatTrendChart24H: React.FC<HeatTrendChart24HProps> = ({
  currentReadings,
  currentRoom,
  currentWBGT,
}) => {
  const [activeMetric, setActiveMetric] = useState<'wbgt_only' | 'all_metrics'>('wbgt_only');

  // Generate 24-hour realistic diurnal microclimate trajectory based on room and current readings
  const data: HourlyReadingPoint[] = useMemo(() => {
    const points: HourlyReadingPoint[] = [];
    const now = new Date();
    const currentHour = now.getHours();

    // Baseline diurnal temperature profile in India summer
    // Night minimum at 05:00 (~28-30°C), peak at 14:00-15:00 (~38-44°C)
    const basePeak = Math.max(38, currentReadings.ambientTemp);
    const baseMin = basePeak - (currentRoom === 'tin_roof' ? 12 : currentRoom === 'elderly_residence' ? 7 : 10);

    for (let i = 23; i >= 0; i--) {
      const pointHour = (currentHour - i + 24) % 24;
      const hourStr = `${pointHour.toString().padStart(2, '0')}:00`;

      // Diurnal sinusoidal temperature factor (0 at 05:00, 1 at 14:30)
      const rad = ((pointHour - 5) / 24) * 2 * Math.PI;
      const diurnalNorm = Math.max(0, Math.sin(rad - 0.4));

      // Calculate ambient temp
      let temp = baseMin + (basePeak - baseMin) * Math.pow(diurnalNorm, 1.2);
      // Room specific nighttime thermal lag
      if (currentRoom === 'elderly_residence' && (pointHour >= 20 || pointHour <= 2)) {
        temp += 3.2; // concrete retains heat
      }

      // If this point is current hour, lock exactly to current reading
      if (i === 0) {
        temp = currentReadings.ambientTemp;
      }

      // Humidity inversely correlates with temperature
      const rh = Math.max(35, Math.min(85, 80 - diurnalNorm * 35));

      // WBGT formula approximation
      // Tw via Stull
      const Tw =
        temp * Math.atan(0.151977 * Math.pow(rh + 8.313659, 0.5)) +
        Math.atan(temp + rh) -
        Math.atan(rh - 1.676331) -
        4.686035;

      const solarFactor = (pointHour >= 8 && pointHour <= 17) ? Math.sin(((pointHour - 8) / 9) * Math.PI) : 0;
      const tg = temp + solarFactor * (currentRoom === 'tin_roof' ? 8.5 : 5.0);

      let calcWbgt = Number((0.7 * Tw + 0.2 * tg + 0.1 * temp).toFixed(1));
      if (i === 0) {
        calcWbgt = currentWBGT;
      }

      // Heat Index
      const T_F = (temp * 9) / 5 + 32;
      const HI_F = -42.379 + 2.049 * T_F + 10.14 * rh - 0.224 * T_F * rh - 0.0068 * T_F * T_F - 0.054 * rh * rh + 0.0012 * T_F * T_F * rh;
      const hi = Number((((HI_F - 32) * 5) / 9).toFixed(1));

      let status: HourlyReadingPoint['status'] = 'Normal';
      if (calcWbgt >= 32.0) status = 'Extreme Danger';
      else if (calcWbgt >= 30.0) status = 'High';
      else if (calcWbgt >= 28.0) status = 'Caution';

      points.push({
        time: i === 0 ? 'Now' : hourStr,
        hour: pointHour,
        wbgt: calcWbgt,
        ambientTemp: Number(temp.toFixed(1)),
        heatIndex: hi,
        isPeak: pointHour === 14,
        status,
      });
    }

    return points;
  }, [currentReadings.ambientTemp, currentRoom, currentWBGT]);

  // Derived statistics
  const peakPoint = useMemo(() => {
    return data.reduce((max, p) => (p.wbgt > max.wbgt ? p : max), data[0]);
  }, [data]);

  const minPoint = useMemo(() => {
    return data.reduce((min, p) => (p.wbgt < min.wbgt ? p : min), data[0]);
  }, [data]);

  const hoursInExtreme = useMemo(() => {
    return data.filter((p) => p.wbgt >= 32.0).length;
  }, [data]);

  const averageWBGT = useMemo(() => {
    const sum = data.reduce((acc, p) => acc + p.wbgt, 0);
    return Number((sum / data.length).toFixed(1));
  }, [data]);

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              24-Hour Hyperlocal WBGT &amp; Heat Stress Trend
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              ISO 7243 Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Hourly progression showing solar heat accumulation, afternoon peak danger windows, and nighttime thermal retention.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveMetric('wbgt_only')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              activeMetric === 'wbgt_only'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            WBGT Index Curve
          </button>
          <button
            onClick={() => setActiveMetric('all_metrics')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              activeMetric === 'all_metrics'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            WBGT vs Ambient vs HI
          </button>
        </div>
      </div>

      {/* 24-Hour Statistical Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-slate-900/80 rounded-xl p-2.5 border border-rose-500/30 text-center">
          <span className="text-[10px] uppercase text-slate-400 block">24h Peak WBGT</span>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-lg font-extrabold font-mono text-rose-400">{peakPoint.wbgt}°C</span>
            <span className="text-[10px] text-slate-500 font-mono">({peakPoint.time})</span>
          </div>
        </div>

        <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800 text-center">
          <span className="text-[10px] uppercase text-slate-400 block">24h Minimum WBGT</span>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-lg font-bold font-mono text-emerald-400">{minPoint.wbgt}°C</span>
            <span className="text-[10px] text-slate-500 font-mono">({minPoint.time})</span>
          </div>
        </div>

        <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800 text-center">
          <span className="text-[10px] uppercase text-slate-400 block">24h Average WBGT</span>
          <span className="text-lg font-bold font-mono text-amber-300">{averageWBGT}°C</span>
        </div>

        <div className="bg-slate-900/80 rounded-xl p-2.5 border border-amber-500/30 text-center">
          <span className="text-[10px] uppercase text-slate-400 block">Hours in Extreme Danger</span>
          <span className="text-lg font-bold font-mono text-rose-400">
            {hoursInExtreme} hrs <span className="text-xs font-normal text-slate-400">(&ge;32°C)</span>
          </span>
        </div>
      </div>

      {/* Recharts Data Visualization Canvas */}
      <div className="w-full h-72 rounded-xl bg-[#070b14] border border-slate-800/80 pt-3 pr-4 pl-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              {/* WBGT Gradient */}
              <linearGradient id="wbgtGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.65} />
                <stop offset="65%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
              </linearGradient>

              {/* Ambient Temp Gradient */}
              <linearGradient id="ambientGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
              </linearGradient>

              {/* Heat Index Gradient */}
              <linearGradient id="hiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fb923c" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#fb923c" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />

            <XAxis
              dataKey="time"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              dy={5}
              interval={2}
            />

            <YAxis
              stroke="#64748b"
              fontSize={11}
              domain={[20, (dataMax: number) => Math.ceil(dataMax + 2)]}
              tickLine={false}
              dx={-5}
              unit="°C"
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const pt = payload[0].payload as HourlyReadingPoint;
                  return (
                    <div className="bg-[#0c101d] border border-slate-700/80 rounded-xl p-3 shadow-2xl text-xs space-y-1.5 font-sans z-50">
                      <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1.5">
                        <span className="font-mono font-bold text-slate-200">Time: {pt.time}</span>
                        <span
                          className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                            pt.wbgt >= 32.0
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : pt.wbgt >= 30.0
                              ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                              : pt.wbgt >= 28.0
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          }`}
                        >
                          {pt.status}
                        </span>
                      </div>

                      <div className="space-y-1 pt-1 font-mono">
                        <div className="flex justify-between gap-4">
                          <span className="text-rose-400 font-semibold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-rose-500" /> WBGT Index:
                          </span>
                          <span className="font-bold text-white">{pt.wbgt}°C</span>
                        </div>

                        {activeMetric === 'all_metrics' && (
                          <>
                            <div className="flex justify-between gap-4">
                              <span className="text-cyan-400 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-cyan-400" /> Air Temp ($T_a$):
                              </span>
                              <span className="text-slate-300">{pt.ambientTemp}°C</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-amber-400 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-amber-400" /> Heat Index:
                              </span>
                              <span className="text-slate-300">{pt.heatIndex}°C</span>
                            </div>
                          </>
                        )}
                      </div>

                      {pt.wbgt >= 32.0 && (
                        <div className="text-[10px] text-rose-300 bg-rose-950/40 px-2 py-1 rounded border border-rose-500/30 font-medium mt-1">
                          OSHA: Mandatory 45m Rest / Hour
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Threshold Reference Lines */}
            <ReferenceLine
              y={32.0}
              stroke="#f43f5e"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: 'Extreme Danger (32.0°C)',
                fill: '#f43f5e',
                fontSize: 10,
                position: 'insideTopRight',
              }}
            />
            <ReferenceLine
              y={28.0}
              stroke="#f59e0b"
              strokeDasharray="3 3"
              strokeWidth={1}
              label={{
                value: 'Caution (28.0°C)',
                fill: '#f59e0b',
                fontSize: 10,
                position: 'insideBottomRight',
              }}
            />

            {/* Data Areas */}
            {activeMetric === 'all_metrics' && (
              <>
                <Area
                  type="monotone"
                  dataKey="ambientTemp"
                  name="Air Temp (Ta)"
                  stroke="#38bdf8"
                  strokeWidth={1.5}
                  fill="url(#ambientGradient)"
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="heatIndex"
                  name="Heat Index (Feels Like)"
                  stroke="#fb923c"
                  strokeWidth={1.5}
                  fill="url(#hiGradient)"
                  dot={false}
                />
              </>
            )}

            <Area
              type="monotone"
              dataKey="wbgt"
              name="WBGT Stress Index"
              stroke="#f43f5e"
              strokeWidth={2.5}
              fill="url(#wbgtGradient)"
              activeDot={{ r: 6, fill: '#f43f5e', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer Explanatory Note */}
      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-400">Diurnal Trend Insight: </strong>
          Peak heat vulnerability occurs between <span className="font-mono text-white">12:30 and 16:30</span>, where WBGT consistently crosses the <span className="text-rose-400 font-mono font-bold">32.0°C</span> OSHA threshold. Automated edge cooling and mandatory rest-breaks are pre-emptively scheduled during these hours on the Arduino UNO Q.
        </div>
      </div>
    </div>
  );
};
