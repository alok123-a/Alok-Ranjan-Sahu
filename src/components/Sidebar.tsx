import React from 'react';
import {
  Flame,
  LayoutDashboard,
  Gauge,
  Cpu,
  Clock,
  MapPin,
  BatteryCharging,
  Terminal,
  Volume2,
  VolumeX,
  Smartphone,
  Monitor,
  FileSpreadsheet,
  User,
  ShieldCheck,
} from 'lucide-react';
import { UserProfile } from '../types';

export type NavTab =
  | 'overview'
  | 'telemetry'
  | 'forecast'
  | 'rest_breaks'
  | 'city_map'
  | 'power_grid'
  | 'history_log'
  | 'firmware';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  isMobilePreview: boolean;
  setIsMobilePreview: (val: boolean) => void;
  currentUser: UserProfile | null;
  onOpenAuthModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isMuted,
  setIsMuted,
  isMobilePreview,
  setIsMobilePreview,
  currentUser,
  onOpenAuthModal,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'overview', label: 'Edge Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'telemetry', label: 'Sensors & Thermal IR', icon: <Gauge className="w-5 h-5" /> },
    { id: 'forecast', label: 'AI Thermal Predictor', icon: <Cpu className="w-5 h-5" />, badge: 'TFLite' },
    { id: 'rest_breaks', label: 'Rest-Break & Relays', icon: <Clock className="w-5 h-5" /> },
    { id: 'city_map', label: 'City Heat Map', icon: <MapPin className="w-5 h-5" /> },
    { id: 'power_grid', label: 'Grid Failure Resilience', icon: <BatteryCharging className="w-5 h-5" /> },
    { id: 'history_log', label: 'Thermal History Log', icon: <FileSpreadsheet className="w-5 h-5" />, badge: 'CSV' },
    { id: 'firmware', label: 'Arduino Bridge & Code', icon: <Terminal className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 bg-[#0e1424] border-r border-slate-800/80 flex flex-col justify-between p-4 shrink-0 h-screen sticky top-0 z-30 select-none">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3 py-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-white">ThermaEdge</span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                UNO Q
              </span>
            </div>
            <p className="text-xs text-slate-400">BPUT Hackathon 2026</p>
          </div>
        </div>

        {/* User Profile & Age Category Card */}
        <div className="mb-4 px-1">
          {currentUser ? (
            <div
              onClick={onOpenAuthModal}
              className="p-2.5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-500/30 hover:border-indigo-400 transition-all cursor-pointer group"
              title="Click to view or calibrate personal heat category"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-300 flex items-center gap-1">
                  <span>{currentUser.persona === 'elderly' ? '👵' : currentUser.persona === 'student' ? '🎒' : currentUser.persona === 'labourer' ? '👷' : '👤'}</span>
                  <span className="truncate max-w-[100px]">{currentUser.name}</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-200 border border-indigo-500/40 font-bold">
                  {currentUser.age} yrs
                </span>
              </div>
              <span className="text-[11px] font-bold text-white block truncate">
                {currentUser.categoryLabel.split('(')[0].trim()}
              </span>
              <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-800/80 text-[10px] text-slate-400">
                <span className="truncate max-w-[140px]">
                  {currentUser.dateOfBirth ? `DOB ${currentUser.dateOfBirth}` : `+91 ${currentUser.phone}`}
                </span>
                <span className="text-rose-400 font-mono font-bold">{currentUser.safeThresholdWbgt}°C</span>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="w-full p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-slate-900 border border-amber-500/40 hover:border-amber-400 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>Personalize Protection</span>
                </span>
                <span className="text-[10px] font-mono text-amber-400 font-bold">Age</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Sign in &amp; enter age to identify category &amp; customize alerts.
              </p>
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-400 border border-amber-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-amber-400' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status & Toggles */}
      <div className="space-y-3 pt-4 border-t border-slate-800/80">
        {/* Device Mode Switcher */}
        <div className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">View Layout:</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setIsMobilePreview(false)}
              className={`p-1.5 rounded text-xs transition-colors ${
                !isMobilePreview ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
              title="Desktop Web Layout"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsMobilePreview(true)}
              className={`p-1.5 rounded text-xs transition-colors ${
                isMobilePreview ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
              title="Mobile Companion App Mode"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Audio Mute & Edge Siren State */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
          <span>Edge Piezo Buzzer</span>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-1.5 rounded-lg border transition-colors ${
              isMuted
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}
            title={isMuted ? 'Unmute Edge Buzzer' : 'Mute Edge Buzzer'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Dual Core Edge Pill */}
        <div className="p-2.5 rounded-xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
            <span>QUALCOMM QRB2210</span>
            <span className="text-emerald-400 font-semibold">ONLINE</span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>STM32U585 MCU</span>
            <span className="text-cyan-400 font-semibold">0.4mA LP</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
