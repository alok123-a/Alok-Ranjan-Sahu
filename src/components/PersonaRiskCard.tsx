import React, { useMemo } from 'react';
import { VulnerablePersona, HeatStressMetrics, UserProfile } from '../types';
import {
  Users,
  AlertTriangle,
  Clock,
  Droplets,
  HeartPulse,
  Activity,
  ShieldAlert,
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface PersonaRiskCardProps {
  persona: VulnerablePersona;
  metrics: HeatStressMetrics;
  onSelectPersona: (p: VulnerablePersona) => void;
  currentUser?: UserProfile | null;
}

interface RiskFactorDataPoint {
  factor: string;
  score: number;
  maxScore: number;
  description: string;
}

export const PersonaRiskCard: React.FC<PersonaRiskCardProps> = ({
  persona,
  metrics,
  onSelectPersona,
  currentUser,
}) => {
  const personas = [
    { id: 'labourer' as VulnerablePersona, label: 'Labourer / Works', icon: '👷' },
    { id: 'student' as VulnerablePersona, label: 'School Child', icon: '🎒' },
    { id: 'elderly' as VulnerablePersona, label: 'Elderly Citizen', icon: '👵' },
    { id: 'general' as VulnerablePersona, label: 'General / Home', icon: '👤' },
  ];

  // Dynamic radar chart data reflecting the persona's physiological vulnerabilities and ambient WBGT load
  const radarData: RiskFactorDataPoint[] = useMemo(() => {
    // Ambient heat multiplier (0 to 15 points based on WBGT)
    const wbgtLift = Math.max(0, Math.min(15, (metrics.wbgtOutdoor - 28) * 2.5));

    switch (persona) {
      case 'labourer':
        return [
          {
            factor: 'Exertion',
            score: Math.min(100, Math.round(92 + wbgtLift * 0.5)),
            maxScore: 100,
            description: 'High metabolic rate (350-450 W/m²) generates rapid internal heat',
          },
          {
            factor: 'Hydration',
            score: Math.min(100, Math.round(88 + wbgtLift * 0.8)),
            maxScore: 100,
            description: 'Profuse sweating triggers acute electrolyte and fluid depletion',
          },
          {
            factor: 'Age',
            score: Math.min(100, Math.round(40 + wbgtLift * 0.3)),
            maxScore: 100,
            description: 'Working-age baseline tolerance with cumulative heat fatigue',
          },
          {
            factor: 'Health Status',
            score: Math.min(100, Math.round(75 + wbgtLift * 0.7)),
            maxScore: 100,
            description: 'Elevated heart rate under sustained sun & asphalt radiant flux',
          },
        ];

      case 'student':
        return [
          {
            factor: 'Exertion',
            score: Math.min(100, Math.round(62 + wbgtLift * 0.5)),
            maxScore: 100,
            description: 'Classroom restlessness and playground sports activity',
          },
          {
            factor: 'Hydration',
            score: Math.min(100, Math.round(85 + wbgtLift * 0.9)),
            maxScore: 100,
            description: 'Children forget to drink water frequently; lower sweat output',
          },
          {
            factor: 'Age',
            score: Math.min(100, Math.round(78 + wbgtLift * 0.4)),
            maxScore: 100,
            description: 'Higher surface-area-to-body-mass ratio absorbs ambient heat faster',
          },
          {
            factor: 'Health Status',
            score: Math.min(100, Math.round(45 + wbgtLift * 0.6)),
            maxScore: 100,
            description: 'Vulnerable to cognitive lethargy, heat cramps, and dehydration headache',
          },
        ];

      case 'elderly':
        return [
          {
            factor: 'Exertion',
            score: Math.min(100, Math.round(30 + wbgtLift * 0.3)),
            maxScore: 100,
            description: 'Low metabolic exertion but low physiological cooling reserve',
          },
          {
            factor: 'Hydration',
            score: Math.min(100, Math.round(82 + wbgtLift * 0.8)),
            maxScore: 100,
            description: 'Blunted thirst perception causes silent acute dehydration',
          },
          {
            factor: 'Age',
            score: Math.min(100, Math.round(96 + wbgtLift * 0.2)),
            maxScore: 100,
            description: 'Impaired vascular dilation and reduced sweating capacity',
          },
          {
            factor: 'Health Status',
            score: Math.min(100, Math.round(94 + wbgtLift * 0.5)),
            maxScore: 100,
            description: 'High cardiovascular workload. Fans alone over 35°C dehydrate body',
          },
        ];

      case 'general':
      default:
        return [
          {
            factor: 'Exertion',
            score: Math.min(100, Math.round(45 + wbgtLift * 0.5)),
            maxScore: 100,
            description: 'Moderate daily movement and standard occupational activity',
          },
          {
            factor: 'Hydration',
            score: Math.min(100, Math.round(52 + wbgtLift * 0.8)),
            maxScore: 100,
            description: 'Standard voluntary hydration response to thirst triggers',
          },
          {
            factor: 'Age',
            score: Math.min(100, Math.round(35 + wbgtLift * 0.3)),
            maxScore: 100,
            description: 'Healthy adult thermoregulatory baseline',
          },
          {
            factor: 'Health Status',
            score: Math.min(100, Math.round(42 + wbgtLift * 0.6)),
            maxScore: 100,
            description: 'Normal cardiovascular response with standard fatigue onset',
          },
        ];
    }
  }, [persona, metrics.wbgtOutdoor]);

  // Composite Vulnerability Index
  const compositeRiskScore = useMemo(() => {
    const avg = radarData.reduce((acc, curr) => acc + curr.score, 0) / radarData.length;
    return Math.round(avg);
  }, [radarData]);

  // Color scheme per persona
  const themeColors = {
    labourer: { stroke: '#f43f5e', fill: '#f43f5e', gradientFrom: '#f43f5e', gradientTo: '#fb7185' },
    student: { stroke: '#f59e0b', fill: '#f59e0b', gradientFrom: '#f59e0b', gradientTo: '#fbbf24' },
    elderly: { stroke: '#ec4899', fill: '#ec4899', gradientFrom: '#ec4899', gradientTo: '#f472b6' },
    general: { stroke: '#06b6d4', fill: '#06b6d4', gradientFrom: '#06b6d4', gradientTo: '#38bdf8' },
  }[persona];

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <Users className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">
            Personalized Heat Risk &amp; Activity Grading
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            ISO 7243 / NIOSH
          </span>
          {currentUser && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/40 flex items-center gap-1">
              <span>{currentUser.persona === 'elderly' ? '👵' : currentUser.persona === 'student' ? '🎒' : currentUser.persona === 'labourer' ? '👷' : '👤'}</span>
              <span>{currentUser.name} (Age {currentUser.age})</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Composite Risk Index:</span>
          <span
            className={`font-mono font-bold px-2 py-0.5 rounded-full text-xs border ${
              compositeRiskScore >= 80
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : compositeRiskScore >= 60
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}
          >
            {compositeRiskScore} / 100
          </span>
        </div>
      </div>

      {/* Main 2-Column Content: Left Details & Right Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Left Column (7 cols): Persona Tabs, Advice Box & Prescriptive Metrics */}
        <div className="lg:col-span-7 space-y-3.5">
          {/* Persona Selector Tabs */}
          <div className="grid grid-cols-4 gap-2">
            {personas.map((p) => {
              const isSelected = persona === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectPersona(p.id)}
                  className={`py-2 px-2 rounded-xl text-xs font-medium transition-all text-center flex flex-col items-center gap-0.5 border ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm ring-1 ring-amber-500/30'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800/80 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <span className="text-base">{p.icon}</span>
                  <span className="truncate w-full text-[11px] font-semibold">{p.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tailored Advice Box */}
          <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800/90">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  metrics.riskCategory === 'extreme_danger'
                    ? 'bg-rose-500 animate-ping'
                    : metrics.riskCategory === 'danger'
                    ? 'bg-orange-500'
                    : metrics.riskCategory === 'extreme_caution'
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
              />
              <span className="text-xs font-bold text-white uppercase tracking-wide">
                {metrics.riskLabel}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{metrics.riskDescription}</p>
          </div>

          {/* Prescriptive Metrics Row */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-800">
              <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px]">Max Continuous Work</span>
              </div>
              <span className="font-extrabold text-amber-300 font-mono text-sm">
                {metrics.maxContinuousWorkMinutes} min
              </span>
            </div>

            <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-800">
              <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
                <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-[10px]">Mandatory Rest / Hr</span>
              </div>
              <span className="font-extrabold text-rose-300 font-mono text-sm">
                {metrics.restMinutesPerHour} min
              </span>
            </div>

            <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-800">
              <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[10px]">Target Hydration</span>
              </div>
              <span className="font-extrabold text-cyan-300 font-mono text-sm">
                {metrics.recommendedWaterPerHourMl} ml/h
              </span>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Vulnerability Radar Chart */}
        <div className="lg:col-span-5 bg-[#070b14] rounded-2xl p-4 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-bold text-white">Vulnerability Risk Radar</span>
            </div>
            <span className="text-[10px] text-slate-400 capitalize font-mono">
              {persona} Profile
            </span>
          </div>

          <div className="w-full h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 10, right: 25, bottom: 10, left: 25 }}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis
                  dataKey="factor"
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={false}
                  axisLine={false}
                />
                <Radar
                  name="Risk Factor"
                  dataKey="score"
                  stroke={themeColors.stroke}
                  fill={themeColors.fill}
                  fillOpacity={0.45}
                  strokeWidth={2}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as RiskFactorDataPoint;
                      return (
                        <div className="bg-[#0c101d] border border-slate-700 rounded-xl p-2.5 shadow-xl text-xs space-y-1">
                          <div className="flex justify-between gap-3 border-b border-slate-800 pb-1">
                            <span className="font-bold text-white">{item.factor}</span>
                            <span className="font-mono font-bold text-amber-400">{item.score}/100</span>
                          </div>
                          <p className="text-[10px] text-slate-300 max-w-[180px] leading-tight">
                            {item.description}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Factor Breakdown Legend */}
          <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-800/80 text-[10px]">
            {radarData.map((d) => (
              <div key={d.factor} className="flex justify-between items-center bg-slate-900/60 px-2 py-1 rounded-lg">
                <span className="text-slate-400">{d.factor}:</span>
                <span className="font-mono font-bold text-slate-200">{d.score}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
