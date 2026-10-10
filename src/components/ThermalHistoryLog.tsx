import React, { useState, useMemo } from 'react';
import {
  ExtremeHeatEvent,
  RoomEnvironment,
  VulnerablePersona,
  SensorReadings,
  HeatStressMetrics,
} from '../types';
import {
  INITIAL_HISTORICAL_EVENTS,
  exportEventsToCSV,
  triggerCSVDownload,
} from '../services/historyLogService';
import {
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  PlusCircle,
  AlertTriangle,
  Flame,
  Clock,
  BatteryCharging,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpDown,
  Building,
  User,
  Check,
} from 'lucide-react';

interface ThermalHistoryLogProps {
  currentReadings: SensorReadings;
  currentRoom: RoomEnvironment;
  currentPersona: VulnerablePersona;
  currentMetrics: HeatStressMetrics;
  gridConnected: boolean;
}

export const ThermalHistoryLog: React.FC<ThermalHistoryLogProps> = ({
  currentReadings,
  currentRoom,
  currentPersona,
  currentMetrics,
  gridConnected,
}) => {
  const [events, setEvents] = useState<ExtremeHeatEvent[]>(() => {
    // Attempt to load saved events from localStorage, fallback to initial dataset
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('thermaedge_historical_events');
        if (saved) {
          return JSON.parse(saved);
        }
      } catch {
        // fallback
      }
    }
    return INITIAL_HISTORICAL_EVENTS;
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [selectedPersona, setSelectedPersona] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest_wbgt'>('newest');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showLogSuccess, setShowLogSuccess] = useState<boolean>(false);

  // Sync state to localStorage
  const saveEvents = (updated: ExtremeHeatEvent[]) => {
    setEvents(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('thermaedge_historical_events', JSON.stringify(updated));
      } catch {
        // safe fallback
      }
    }
  };

  // Add current microclimate reading as a new incident
  const handleLogCurrentReading = () => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timestampStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
      now.getHours()
    )}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const zoneNames: Record<RoomEnvironment, string> = {
      tin_roof: 'Unit-8 Shanti Nagar Informal Rooftops',
      construction_site: 'NH-16 Flyover Highway Works Site',
      school_classroom: 'Capital Primary School Campus (Class 4B)',
      elderly_residence: 'Saheed Nagar Senior Residence',
      factory_floor: 'Mancheswar Industrial Metal Shed',
    };

    let severity: ExtremeHeatEvent['severity'] = 'Elevated';
    if (currentMetrics.wbgtOutdoor >= 34.0) severity = 'Critical';
    else if (currentMetrics.wbgtOutdoor >= 32.0) severity = 'Severe';

    const relays: string[] = [];
    if (currentMetrics.wbgtOutdoor >= 30.0) relays.push('Relay 1: Cooler Fan');
    if (currentMetrics.wbgtOutdoor >= 32.0) relays.push('Relay 2: Micro-Misting');
    if (currentPersona === 'labourer' && currentMetrics.wbgtOutdoor >= 32.0)
      relays.push('Relay 4: Rest Siren');

    const newEvent: ExtremeHeatEvent = {
      id: `EVT-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: timestampStr,
      zone: zoneNames[currentRoom],
      roomType: currentRoom,
      ambientTemp: currentReadings.ambientTemp,
      relativeHumidity: currentReadings.relativeHumidity,
      blackGlobeTemp: currentReadings.blackGlobeTemp,
      roofSurfaceTemp: currentReadings.roofSurfaceTemp,
      wbgt: currentMetrics.wbgtOutdoor,
      heatIndex: currentMetrics.heatIndex,
      riskCategory:
        currentMetrics.riskCategory === 'normal' || currentMetrics.riskCategory === 'caution'
          ? 'extreme_caution'
          : (currentMetrics.riskCategory as ExtremeHeatEvent['riskCategory']),
      severity,
      personaAtRisk: currentPersona,
      restEnforced: `${currentMetrics.restMinutesPerHour}m Rest / ${currentMetrics.maxContinuousWorkMinutes}m Work`,
      relaysTriggered: relays.length > 0 ? relays : ['Relay 1: Idle Standby'],
      powerSource: gridConnected ? 'Grid Normal' : 'Solar LiFePO4 Island',
      notes: `Real-time manual snapshot logged during BPUT Hackathon field simulation. Solar load: ${currentReadings.solarIrradiance} W/m².`,
    };

    saveEvents([newEvent, ...events]);
    setShowLogSuccess(true);
    setTimeout(() => setShowLogSuccess(false), 2500);
  };

  // CSV Export
  const handleExportCSV = () => {
    const csvData = exportEventsToCSV(filteredEvents);
    const dateStr = new Date().toISOString().slice(0, 10);
    triggerCSVDownload(csvData, `bput_hackathon_extreme_heat_research_log_${dateStr}.csv`);
  };

  // Filtering and Sorting
  const filteredEvents = useMemo(() => {
    return events
      .filter((e) => {
        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            e.id.toLowerCase().includes(q) ||
            e.zone.toLowerCase().includes(q) ||
            e.notes.toLowerCase().includes(q) ||
            e.timestamp.includes(q);
          if (!matches) return false;
        }

        // Severity filter
        if (selectedSeverity !== 'all' && e.severity !== selectedSeverity) {
          return false;
        }

        // Room filter
        if (selectedRoom !== 'all' && e.roomType !== selectedRoom) {
          return false;
        }

        // Persona filter
        if (selectedPersona !== 'all' && e.personaAtRisk !== selectedPersona) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        } else if (sortBy === 'oldest') {
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        } else if (sortBy === 'highest_wbgt') {
          return b.wbgt - a.wbgt;
        }
        return 0;
      });
  }, [events, searchQuery, selectedSeverity, selectedRoom, selectedPersona, sortBy]);

  // Statistics for Research KPI cards
  const stats = useMemo(() => {
    const total = events.length;
    const maxWBGT = events.reduce((max, e) => (e.wbgt > max ? e.wbgt : max), 0);
    const criticalCount = events.filter((e) => e.severity === 'Critical').length;
    const solarIslandCount = events.filter((e) => e.powerSource === 'Solar LiFePO4 Island').length;
    const outagePercentage = total > 0 ? Math.round((solarIslandCount / total) * 100) : 0;
    return { total, maxWBGT, criticalCount, outagePercentage };
  }, [events]);

  const copyEventId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="space-y-5">
      {/* Top Header Banner */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">
              Thermal History Log &amp; Research Dataset
            </h2>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              CSV Export Ready
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Chronological audit log of extreme heat spikes, autonomous edge relay responses, and OSHA work-rest mandates. Engineered for field research and City Heat Action Plans (HAP) at BPUT Hackathon 2026.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleLogCurrentReading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all shadow-md shadow-orange-500/20"
            title="Log current live sensor reading into historical dataset"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Log Current Microclimate</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20"
            title="Export full chronological research log as CSV"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Dataset ({filteredEvents.length})</span>
          </button>
        </div>
      </div>

      {showLogSuccess && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-xl px-4 py-2.5 text-xs text-emerald-300 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              Current sensor reading successfully logged into the research dataset (WBGT: {currentMetrics.wbgtOutdoor}°C).
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400">Added to Top</span>
        </div>
      )}

      {/* Analytical Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-panel rounded-2xl p-3.5 border border-slate-800 text-center">
          <span className="text-[10px] uppercase text-slate-400 block flex items-center justify-center gap-1">
            <Layers className="w-3 h-3 text-slate-400" /> Total Incidents Logged
          </span>
          <span className="text-2xl font-bold font-mono text-white mt-1 block">
            {stats.total}
          </span>
          <span className="text-[10px] text-slate-500">Autonomous Edge Records</span>
        </div>

        <div className="glass-panel rounded-2xl p-3.5 border border-rose-500/30 text-center bg-rose-950/10">
          <span className="text-[10px] uppercase text-slate-400 block flex items-center justify-center gap-1">
            <Flame className="w-3 h-3 text-rose-400" /> Peak Recorded WBGT
          </span>
          <span className="text-2xl font-bold font-mono text-rose-400 mt-1 block">
            {stats.maxWBGT}°C
          </span>
          <span className="text-[10px] text-rose-300/80">Extreme Hazard Level</span>
        </div>

        <div className="glass-panel rounded-2xl p-3.5 border border-amber-500/30 text-center bg-amber-950/10">
          <span className="text-[10px] uppercase text-slate-400 block flex items-center justify-center gap-1">
            <ShieldAlert className="w-3 h-3 text-amber-400" /> Critical Severity Events
          </span>
          <span className="text-2xl font-bold font-mono text-amber-400 mt-1 block">
            {stats.criticalCount}
          </span>
          <span className="text-[10px] text-slate-400">Rest Breaks Enforced</span>
        </div>

        <div className="glass-panel rounded-2xl p-3.5 border border-cyan-500/30 text-center bg-cyan-950/10">
          <span className="text-[10px] uppercase text-slate-400 block flex items-center justify-center gap-1">
            <BatteryCharging className="w-3 h-3 text-cyan-400" /> Outage Survival Ratio
          </span>
          <span className="text-2xl font-bold font-mono text-cyan-300 mt-1 block">
            {stats.outagePercentage}%
          </span>
          <span className="text-[10px] text-slate-400">Captured on LiFePO4 Battery</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search zone, timestamp, notes..."
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Severity Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
            >
              <option value="all">All Severities</option>
              <option value="Critical">Critical (≥34°C)</option>
              <option value="Severe">Severe (≥32°C)</option>
              <option value="Elevated">Elevated (≥30°C)</option>
            </select>
          </div>

          {/* Room Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
            >
              <option value="all">All Room Envelopes</option>
              <option value="tin_roof">Tin-Roof Rooftop</option>
              <option value="construction_site">Highway Works</option>
              <option value="school_classroom">Primary School</option>
              <option value="elderly_residence">Senior Residence</option>
              <option value="factory_floor">Industrial Shed</option>
            </select>
          </div>

          {/* Persona Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedPersona}
              onChange={(e) => setSelectedPersona(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
            >
              <option value="all">All Personas</option>
              <option value="labourer">Outdoor Labourer</option>
              <option value="student">School Child</option>
              <option value="elderly">Elderly Citizen</option>
              <option value="general">General Citizen</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 cursor-pointer font-medium"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="highest_wbgt">Sort: Highest WBGT</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span>
            Showing <strong className="text-white font-mono">{filteredEvents.length}</strong> of{' '}
            <strong className="text-white font-mono">{events.length}</strong> recorded research entries
          </span>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedSeverity('all');
              setSelectedRoom('all');
              setSelectedPersona('all');
              setSortBy('newest');
            }}
            className="text-amber-400 hover:underline"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Chronological Table of Extreme Heat Events */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Event ID / Time</th>
                <th className="py-3 px-4">Zone &amp; Envelope</th>
                <th className="py-3 px-4 text-center">Microclimate Readings</th>
                <th className="py-3 px-4 text-center">WBGT Index</th>
                <th className="py-3 px-4">Severity &amp; Risk</th>
                <th className="py-3 px-4">Rest Mandate</th>
                <th className="py-3 px-4">Autonomous Relays</th>
                <th className="py-3 px-4">Power Mode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans text-slate-300">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No extreme heat events match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => {
                  const isCritical = evt.severity === 'Critical';
                  const isSevere = evt.severity === 'Severe';

                  return (
                    <tr
                      key={evt.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* ID & Timestamp */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 mb-1">
                          <button
                            onClick={() => copyEventId(evt.id)}
                            className="font-mono text-xs font-bold text-slate-300 group-hover:text-amber-400 transition-colors flex items-center gap-1"
                            title="Click to copy Event ID"
                          >
                            <span>{evt.id}</span>
                            {copiedId === evt.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : null}
                          </button>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{evt.timestamp}</span>
                        </span>
                      </td>

                      {/* Zone & Envelope */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <span className="font-bold text-white block truncate">{evt.zone}</span>
                        <span className="text-[10px] text-slate-400 capitalize">
                          {evt.roomType.replace('_', ' ')} · {evt.personaAtRisk}
                        </span>
                      </td>

                      {/* Microclimate Readings */}
                      <td className="py-3.5 px-4 text-center font-mono text-[11px]">
                        <div className="space-y-0.5">
                          <div>
                            <span className="text-slate-400">Ta: </span>
                            <span className="font-bold text-slate-200">{evt.ambientTemp}°C</span>
                            <span className="text-slate-500"> ({evt.relativeHumidity}%)</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Roof: </span>
                            <span className="font-bold text-purple-400">{evt.roofSurfaceTemp}°C</span>
                          </div>
                        </div>
                      </td>

                      {/* WBGT & HI */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`text-base font-extrabold font-mono block ${
                            isCritical ? 'text-rose-400' : isSevere ? 'text-orange-400' : 'text-amber-400'
                          }`}
                        >
                          {evt.wbgt}°C
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          HI: {evt.heatIndex}°C
                        </span>
                      </td>

                      {/* Severity Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isCritical
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : isSevere
                              ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          <span>{evt.severity}</span>
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1 truncate max-w-[150px]">
                          {evt.notes}
                        </p>
                      </td>

                      {/* Rest Mandate */}
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-semibold text-rose-300 block">
                          {evt.restEnforced}
                        </span>
                        <span className="text-[10px] text-slate-400">OSHA Mandate</span>
                      </td>

                      {/* Relays Triggered */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[160px]">
                          {evt.relaysTriggered.map((r, i) => (
                            <span
                              key={i}
                              className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 whitespace-nowrap"
                            >
                              {r.split(':')[0]}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Power Mode */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded border inline-flex items-center gap-1 ${
                            evt.powerSource === 'Solar LiFePO4 Island'
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {evt.powerSource === 'Solar LiFePO4 Island' ? '⚡ Solar Island' : '🔌 Grid'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Notes */}
        <div className="p-3.5 bg-slate-950/70 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-400">
          <span>
            BPUT Hackathon 2026 Analytical Research Standard · Formatted for pandas / NumPy ingestion.
          </span>
          <button
            onClick={handleExportCSV}
            className="text-emerald-400 font-semibold hover:underline flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" /> Download Full CSV Data
          </button>
        </div>
      </div>
    </div>
  );
};
