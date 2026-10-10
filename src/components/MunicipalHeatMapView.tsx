import React, { useState } from 'react';
import { MUNICIPAL_HEAT_NODES } from '../services/mockDataGenerator';
import { MunicipalHeatNode } from '../types';
import {
  MapPin,
  Building,
  TreePine,
  Droplets,
  Paintbrush,
  Download,
  AlertTriangle,
  Info,
  CheckCircle2,
} from 'lucide-react';

export const MunicipalHeatMapView: React.FC = () => {
  const [nodes, setNodes] = useState<MunicipalHeatNode[]>(MUNICIPAL_HEAT_NODES);
  const [selectedNode, setSelectedNode] = useState<MunicipalHeatNode>(MUNICIPAL_HEAT_NODES[0]);
  const [filterIntervention, setFilterIntervention] = useState<string>('all');
  const [showAppliedSuccess, setShowAppliedSuccess] = useState<boolean>(false);

  const toggleCoolRoof = (id: string) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const applied = !n.coolRoofApplied;
          return {
            ...n,
            coolRoofApplied: applied,
            roofTemp: applied ? Number((n.roofTemp - 8.5).toFixed(1)) : Number((n.roofTemp + 8.5).toFixed(1)),
            wbgt: applied ? Number((n.wbgt - 2.1).toFixed(1)) : Number((n.wbgt + 2.1).toFixed(1)),
          };
        }
        return n;
      })
    );
    setSelectedNode((curr) => {
      if (curr.id === id) {
        const applied = !curr.coolRoofApplied;
        return {
          ...curr,
          coolRoofApplied: applied,
          roofTemp: applied ? Number((curr.roofTemp - 8.5).toFixed(1)) : Number((curr.roofTemp + 8.5).toFixed(1)),
          wbgt: applied ? Number((curr.wbgt - 2.1).toFixed(1)) : Number((curr.wbgt + 2.1).toFixed(1)),
        };
      }
      return curr;
    });
    setShowAppliedSuccess(true);
    setTimeout(() => setShowAppliedSuccess(false), 2500);
  };

  const filteredNodes = nodes.filter((n) => {
    if (filterIntervention === 'all') return true;
    if (filterIntervention === 'cool_roof') return n.recommendedIntervention === 'Cool Roof Paint';
    if (filterIntervention === 'misting') return n.recommendedIntervention === 'Misting Shelter';
    if (filterIntervention === 'tree') return n.recommendedIntervention === 'Tree Plantation';
    if (filterIntervention === 'water') return n.recommendedIntervention === 'Rest Stop & Water Kiosk';
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">
              Street-Level Hyperlocal Heat Map &amp; City Heat Action Plan (HAP)
            </h2>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Multi-Node Mesh
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Replaces misleading single-district city averages with hard street-level evidence. Pinpoints extreme heat pockets for cool roof interventions, tree canopy planting, and emergency misting shelters.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setFilterIntervention('all')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              filterIntervention === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Nodes
          </button>
          <button
            onClick={() => setFilterIntervention('cool_roof')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              filterIntervention === 'cool_roof'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Cool Roofs
          </button>
          <button
            onClick={() => setFilterIntervention('misting')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              filterIntervention === 'misting'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Misting Shelters
          </button>
          <button
            onClick={() => setFilterIntervention('water')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              filterIntervention === 'water'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Water Kiosks
          </button>
        </div>
      </div>

      {/* Main Map & Node Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Interactive Street Map Canvas */}
        <div className="lg:col-span-8 glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-300">
              Urban Microclimate Mesh (Bhubaneswar Metro Sector)
            </span>
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Severe WBGT (&ge;34°C)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Elevated (30-33°C)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Shaded Oasis (&lt;28°C)</span>
              </span>
            </div>
          </div>

          {/* Interactive Map Visual */}
          <div className="relative w-full aspect-[16/10] bg-[#070b14] rounded-xl overflow-hidden border border-slate-800/80 shadow-inner">
            {/* Street Grid Graphic Lines */}
            <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="street-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#64748b" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#street-grid)" />
              {/* Arterial Roads */}
              <line x1="0" y1="20%" x2="100%" y2="50%" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6,4" />
              <line x1="30%" y1="0" x2="60%" y2="100%" stroke="#38bdf8" strokeWidth="1.5" />
            </svg>

            {/* Nodes Pins */}
            {filteredNodes.map((n) => {
              const isSelected = selectedNode.id === n.id;
              const isDanger = n.wbgt >= 34;
              const isNormal = n.wbgt < 28;

              return (
                <div
                  key={n.id}
                  onClick={() => setSelectedNode(n)}
                  style={{ left: `${n.coordinates.x}%`, top: `${n.coordinates.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group"
                >
                  {/* Glowing Radar Ring */}
                  {isDanger && (
                    <div className="absolute inset-0 -m-3 rounded-full bg-rose-500/30 animate-ping pointer-events-none" />
                  )}

                  <div
                    className={`px-2.5 py-1 rounded-xl shadow-lg flex items-center gap-1.5 border transition-all transform group-hover:scale-110 ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 font-bold border-white ring-2 ring-amber-400/50 scale-110'
                        : isDanger
                        ? 'bg-rose-950/90 text-rose-200 border-rose-500/60'
                        : isNormal
                        ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/60'
                        : 'bg-slate-900/90 text-amber-200 border-amber-500/50'
                    }`}
                  >
                    <span className="text-xs">
                      {n.coolRoofApplied ? '🛡️' : isDanger ? '🔥' : isNormal ? '🌳' : '📍'}
                    </span>
                    <span className="text-xs font-mono font-bold">{n.wbgt}°C</span>
                  </div>

                  {/* Tooltip on hover */}
                  <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-slate-950 border border-slate-700 text-slate-200 text-[10px] font-medium rounded whitespace-nowrap shadow-xl z-20">
                    {n.name} · Roof: {n.roofTemp}°C
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>6 Active Edge Nodes transmitting via LoRa / Cellular</span>
            <span className="text-emerald-400">Municipal API Sync: Real-time</span>
          </div>
        </div>

        {/* Selected Node Details & Municipal Action Planner */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs text-amber-400 font-semibold block">{selectedNode.zoneType}</span>
                <h3 className="text-sm font-bold text-white">{selectedNode.name}</h3>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Priority #{selectedNode.priorityScore}
              </span>
            </div>

            {/* Node Telemetry */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Wet Bulb Globe (WBGT)</span>
                <span className="text-lg font-bold font-mono text-rose-400">{selectedNode.wbgt}°C</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Roof Surface Peak</span>
                <span className="text-lg font-bold font-mono text-amber-400">{selectedNode.roofTemp}°C</span>
              </div>
            </div>

            {/* Demographics & Action */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Households Directly Exposed:</span>
                <strong className="text-white font-mono">{selectedNode.householdsAtRisk} families</strong>
              </div>

              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Recommended Civic Action:</span>
                <span className="font-semibold text-amber-300">{selectedNode.recommendedIntervention}</span>
              </div>

              <div className="flex justify-between text-slate-300 items-center">
                <span className="text-slate-400">Cool Roof High-Albedo Coating:</span>
                <span
                  className={`font-semibold ${
                    selectedNode.coolRoofApplied ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                >
                  {selectedNode.coolRoofApplied ? 'Applied (-8.5°C)' : 'Not Applied'}
                </span>
              </div>
            </div>

            {/* Simulation Intervention Button */}
            <div className="mt-5">
              <button
                onClick={() => toggleCoolRoof(selectedNode.id)}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                  selectedNode.coolRoofApplied
                    ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold border-amber-400 shadow-md shadow-orange-500/20 hover:brightness-110'
                }`}
              >
                <Paintbrush className="w-4 h-4" />
                <span>
                  {selectedNode.coolRoofApplied
                    ? 'Remove Cool Roof Simulation'
                    : 'Simulate Cool Roof Intervention'}
                </span>
              </button>
            </div>

            {showAppliedSuccess && (
              <div className="mt-2 text-center text-xs text-emerald-400 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Surface dropped 8.5°C; WBGT reduced 2.1°C!</span>
              </div>
            )}
          </div>

          {/* Municipal Export Action */}
          <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Heat Action Plan Report</span>
            <button
              onClick={() => alert('Municipal Heat Action Plan (HAP) GeoJSON & CSV exported successfully!')}
              className="text-amber-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <Download className="w-3.5 h-3.5" /> Export HAP Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
