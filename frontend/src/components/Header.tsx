import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  UploadCloud, 
  PanelLeftClose,
  PanelLeftOpen,
  ArrowRight,
  Search
} from 'lucide-react';
import { useJarvis } from '../engine/context';
import { SCENARIO_DEFINITIONS } from '../engine/scenarios';
import { AudioBriefing } from './AudioBriefing';

interface HeaderProps {
  onOpenIngest?: () => void;
  onOpenCommandPalette?: () => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  showSidebarToggle?: boolean;
  onLaunchPlatform?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenIngest,
  onOpenCommandPalette,
  isSidebarOpen = true,
  onToggleSidebar,
  showSidebarToggle = false,
  onLaunchPlatform
}) => {
  const {
    activeScreen,
    setActiveScreen,
    scenarioStatus,
    startScenario,
    pauseScenario,
    resetAll,
    selectedScenarioId,
    setSelectedScenarioId,
    activeIncident,
    hypotheses,
    blastRadius,
    recommendations,
  } = useJarvis();

  return (
    <header className="h-16 border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-subtle select-none">
      {/* Left: Sidebar Toggle & Brand */}
      <div className="flex items-center space-x-3">
        {showSidebarToggle && onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            title={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition shadow-subtle flex items-center justify-center cursor-pointer"
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="w-4 h-4 text-slate-600" />
            ) : (
              <PanelLeftOpen className="w-4 h-4 text-indigo-600" />
            )}
          </button>
        )}

        <div 
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => setActiveScreen('home')}
        >
          <div className="relative">
            <img 
              src="/jarvis-icon.svg" 
              alt="J.A.R.V.I.S." 
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl shadow-md border border-slate-200/90 object-cover group-hover:scale-105 transition-transform"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/jarvis-icon.png';
              }}
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
          </div>

          <div>
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <span className="font-extrabold tracking-tight text-slate-900 text-sm sm:text-base group-hover:text-indigo-600 transition">
                J.A.R.V.I.S.
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                CAUSAL AI
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-slate-500 font-medium -mt-0.5">
              Incident Reasoning & Visualization
            </p>
          </div>
        </div>
      </div>

      {/* Center: Command Palette Trigger & Scenario Playback Controls */}
      <div className="hidden lg:flex items-center space-x-3">
        {onOpenCommandPalette && (
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center space-x-2.5 px-3 py-1.5 rounded-2xl bg-slate-50/90 hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200/80 transition shadow-subtle cursor-pointer text-xs"
            title="Open Command Palette (Ctrl+K or ⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-medium text-slate-500">Quick find...</span>
            <kbd className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-400 font-bold">
              ⌘K
            </kbd>
          </button>
        )}

        <div className="flex items-center space-x-2 bg-slate-50/90 px-3 py-1.5 rounded-2xl border border-slate-200/80 shadow-subtle">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider pl-1">
            Scenario:
          </span>

          <select
            value={selectedScenarioId}
            onChange={(e) => setSelectedScenarioId(e.target.value)}
            disabled={scenarioStatus === 'running'}
            className="bg-white text-slate-800 font-semibold text-xs rounded-xl px-3 py-1.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-subtle cursor-pointer"
          >
            {Object.values(SCENARIO_DEFINITIONS).map(s => (
              <option key={s.scenario_id} value={s.scenario_id}>
                {s.title}
              </option>
            ))}
          </select>

          {scenarioStatus !== 'running' ? (
            <button
              onClick={() => startScenario()}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{scenarioStatus === 'paused' ? 'Resume' : 'Run'}</span>
            </button>
          ) : (
            <button
              onClick={pauseScenario}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition shadow-sm cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause</span>
            </button>
          )}

          <button
            onClick={resetAll}
            className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition shadow-subtle cursor-pointer"
            title="Reset Telemetry & Graph"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Right: Actions, Audio Briefing & Status */}
      <div className="flex items-center space-x-2 text-xs">
        {activeIncident && (
          <AudioBriefing
            compact
            incident={activeIncident}
            topHypothesis={hypotheses[0]}
            blastRadius={blastRadius}
            recommendations={recommendations}
          />
        )}

        {activeScreen === 'home' && onLaunchPlatform && (
          <button
            onClick={onLaunchPlatform}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-sm cursor-pointer"
          >
            <span>Launch Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}

        {onOpenIngest && (
          <button
            onClick={onOpenIngest}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold transition shadow-subtle cursor-pointer"
            title="Upload or Paste JSON Telemetry"
          >
            <UploadCloud className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden md:inline">Ingest JSON</span>
          </button>
        )}

        {/* Engine Status */}
        <div className="hidden xl:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-mono text-[11px] font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>ENGINE 100% OPERATIONAL</span>
        </div>
      </div>
    </header>
  );
};
