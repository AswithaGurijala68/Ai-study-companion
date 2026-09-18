import React, { useState } from 'react';
import { 
  BookOpen, 
  Layers, 
  BarChart3, 
  ShieldCheck, 
  Settings, 
  Sparkles, 
  User, 
  ChevronDown,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ activePage, setActivePage }) {
  const { currentUser, isAdmin, logout } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-dark-900/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div 
          onClick={() => setActivePage('home')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-purple-500 p-0.5 shadow-lg shadow-brand-500/20 group-hover:scale-105 transition">
            <div className="w-full h-full bg-dark-900 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-brand-400 group-hover:rotate-12 transition" />
            </div>
          </div>
          <div>
            <div className="font-display font-bold text-lg text-white flex items-center gap-2">
              <span>StudyFlow</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30">
                AI Companion
              </span>
            </div>
            <div className="text-[11px] text-slate-400 -mt-0.5">Persistent Learning & Growth</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-dark-800/80 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setActivePage('home')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-2 ${
              activePage === 'home'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActivePage('spaces')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-2 ${
              activePage === 'spaces' || activePage === 'space-detail' || activePage === 'project-workspace'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Spaces & Projects</span>
          </button>

          <button
            onClick={() => setActivePage('analytics')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-2 ${
              activePage === 'analytics'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Global Analytics</span>
          </button>

          <button
            onClick={() => setActivePage('admin')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-2 ${
              activePage === 'admin'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>Admin & Telemetry</span>
          </button>
        </nav>

        {/* Right Section: AI Engine Pill & User Switcher */}
        <div className="flex items-center gap-3">
          {/* AI Engine Status Pill */}
          <div 
            onClick={() => setActivePage('settings')}
            className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 text-xs font-medium cursor-pointer hover:bg-emerald-900/50 transition"
            title="AI Engine Active"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>Gemini / Local Engine</span>
          </div>

          {/* User Profile / Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-dark-800 border border-white/10 hover:border-white/20 transition text-left"
            >
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=128'}
                alt={currentUser?.name}
                className="w-7 h-7 rounded-lg object-cover border border-white/10"
              />
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-white leading-tight flex items-center gap-1.5">
                  <span>{currentUser?.name}</span>
                  {isAdmin && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                      ADMIN
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 leading-none capitalize">{currentUser?.role}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            {/* Dropdown Menu */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-dark-800 border border-white/10 shadow-2xl p-2 z-50 animate-fade-in">
                <div className="px-2 py-2 text-xs text-slate-300">Signed in as <span className="text-white font-semibold">{currentUser?.email}</span></div>
                <div className="border-t border-white/10 my-1 pt-1">
                  <button onClick={() => { logout(); setUserDropdownOpen(false); }} className="w-full flex items-center gap-2 p-2 rounded-lg text-xs text-red-300 hover:bg-red-500/10 transition">
                    <span>Sign out</span>
                  </button>
                  <button
                    onClick={() => {
                      setActivePage('settings');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-lg text-xs text-slate-300 hover:bg-white/5 transition"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Workspace Settings</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
