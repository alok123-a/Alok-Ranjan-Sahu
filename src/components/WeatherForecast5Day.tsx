import React, { useState, useEffect } from 'react';
import {
  Sun,
  CloudSun,
  Flame,
  Droplets,
  RotateCw,
  ExternalLink,
  Cpu,
  Search,
  CheckCircle2,
  Calendar,
  Thermometer,
  ShieldAlert,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { RoomEnvironment } from '../types';

interface ForecastDay {
  day: string;
  date: string;
  tempMax: number;
  tempMin: number;
  humidityAvg: number;
  condition: string;
  heatRiskLevel: 'Normal' | 'Caution' | 'High' | 'Extreme Danger';
  expectedPeakWbgt: number;
  calibrationRecommendation: string;
}

interface GroundedForecastResponse {
  location: string;
  source: string;
  groundedViaGoogleSearch: boolean;
  isQuotaLimited?: boolean;
  forecast: ForecastDay[];
  calibrationInsight: string;
  webSources?: { title: string; uri: string }[];
}

interface WeatherForecast5DayProps {
  currentRoom: RoomEnvironment;
}

export const WeatherForecast5Day: React.FC<WeatherForecast5DayProps> = ({ currentRoom }) => {
  const [location, setLocation] = useState<string>('Bhubaneswar, Odisha');
  const [data, setData] = useState<GroundedForecastResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchForecast = async (targetLoc: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/weather-forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: targetLoc }),
      });
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error('Failed to load grounded weather forecast:', err);
      setError('Unable to fetch live forecast. Using local calibrated telemetry.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast(location);
  }, []);

  const handleLocationChange = (newLoc: string) => {
    setLocation(newLoc);
    fetchForecast(newLoc);
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              5-Day Ambient Forecast &amp; TFLite Model Calibration
            </h3>
            {data?.groundedViaGoogleSearch ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1 font-semibold">
                <Search className="w-2.5 h-2.5" />
                <span>Google Search Grounded</span>
              </span>
            ) : (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-semibold">
                <ShieldAlert className="w-2.5 h-2.5" />
                <span>Calibrated Regional Mesonet</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            External ambient temperature forecasts grounded via Google Search provide boundary conditions to calibrate Arduino UNO Q&apos;s indoor thermal inertia predictions.
          </p>
        </div>

        {/* Location Dropdown & Refresh Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <select
              value={location}
              onChange={(e) => handleLocationChange(e.target.value)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer pr-1"
            >
              <option value="Bhubaneswar, Odisha" className="bg-slate-900 text-white">
                Bhubaneswar, Odisha (HQ)
              </option>
              <option value="Cuttack, Odisha" className="bg-slate-900 text-white">
                Cuttack, Odisha
              </option>
              <option value="Rourkela, Odisha" className="bg-slate-900 text-white">
                Rourkela, Odisha
              </option>
              <option value="Sambalpur, Odisha" className="bg-slate-900 text-white">
                Sambalpur, Odisha
              </option>
              <option value="Delhi, NCR" className="bg-slate-900 text-white">
                Delhi, NCR
              </option>
            </select>
          </div>

          <button
            onClick={() => fetchForecast(location)}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors disabled:opacity-50"
            title="Refresh Grounded Forecast"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && !data && (
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-slate-900/60 rounded-xl p-4 border border-slate-800 h-44" />
          ))}
        </div>
      )}

      {/* 5-Day Forecast Grid */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {data.forecast.map((day, idx) => {
            const isExtreme = day.heatRiskLevel === 'Extreme Danger';
            const isHigh = day.heatRiskLevel === 'High';

            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                  isExtreme
                    ? 'bg-gradient-to-b from-rose-950/30 to-slate-900/80 border-rose-500/40 shadow-sm'
                    : isHigh
                    ? 'bg-gradient-to-b from-amber-950/20 to-slate-900/80 border-amber-500/30'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2">
                    <span className="text-xs font-bold text-white">{day.day}</span>
                    <span className="text-[10px] font-mono text-slate-400">{day.date}</span>
                  </div>

                  {/* Temperature Spectrum */}
                  <div className="my-1.5">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-xl font-black font-mono text-rose-400">
                        {day.tempMax}°C
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        Min {day.tempMin}°C
                      </span>
                    </div>

                    {/* Mini Visual Thermal Bar */}
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-cyan-400 via-amber-400 to-rose-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, (day.tempMax / 50) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Micro Indicators */}
                  <div className="text-[11px] space-y-1 my-2">
                    <div className="flex justify-between text-slate-400">
                      <span>Humidity:</span>
                      <span className="font-mono text-slate-300 font-semibold">{day.humidityAvg}%</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Est. WBGT:</span>
                      <span
                        className={`font-mono font-bold ${
                          day.expectedPeakWbgt >= 34
                            ? 'text-rose-400'
                            : day.expectedPeakWbgt >= 30
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {day.expectedPeakWbgt}°C
                      </span>
                    </div>
                  </div>

                  <span
                    className={`inline-block w-full text-center text-[10px] font-bold py-1 px-1.5 rounded-lg border my-1 truncate ${
                      isExtreme
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : isHigh
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {day.heatRiskLevel}
                  </span>
                </div>

                {/* TFLite Model Calibration Note */}
                <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 leading-tight">
                  <span className="text-cyan-400 font-semibold block mb-0.5">TFLite Offset:</span>
                  <p className="line-clamp-2">{day.calibrationRecommendation}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Model Calibration Engineering Explanation */}
      {data && (
        <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
            <h4 className="text-xs font-bold text-white">
              Qualcomm Dragonwing QRB2210 Neural Calibration Dynamics
            </h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {data.calibrationInsight}
          </p>

          {/* Grounding Attribution & Web Sources */}
          {data.webSources && data.webSources.length > 0 && (
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
              <span className="text-slate-500 font-medium">Google Search Grounding Sources:</span>
              {data.webSources.map((source, i) => (
                <a
                  key={i}
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:underline flex items-center gap-1 font-mono text-[10px]"
                >
                  <span>{source.title}</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
