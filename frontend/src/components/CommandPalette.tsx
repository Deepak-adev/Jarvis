import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  LayoutDashboard,
  AlertTriangle,
  Network,
  Bot,
  GitCompare,
  PlaySquare,
  Award,
  FileText,
  Home,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  UploadCloud,
  ChevronRight,
  Zap,
  Volume2
} from 'lucide-react';
import { useJarvis } from '../engine/context';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenIngest: () => void;
}

interface CommandItem {
  id: string;
  category: 'Navigation' | 'Scenarios' | 'Actions';
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  badge?: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenIngest,
}) => {
  const {
    setActiveScreen,
    startScenario,
    pauseScenario,
    resetAll,
    scenarioStatus,
  } = useJarvis();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const commands: CommandItem[] = useMemo(() => [
    // Navigation
    {
      id: 'nav-home',
      category: 'Navigation',
      title: 'Home / Overview',
      subtitle: 'Executive landing, metrics & architecture overview',
      icon: Home,
      action: () => setActiveScreen('home'),
    },
    {
      id: 'nav-incident',
      category: 'Navigation',
      title: 'Incident Workspace',
      subtitle: '3-zone causal graph, ranked hypotheses & evidence',
      icon: AlertTriangle,
      action: () => setActiveScreen('incident-workspace'),
      badge: 'Core View',
    },
    {
      id: 'nav-command',
      category: 'Navigation',
      title: 'Command Center',
      subtitle: 'Health matrix, active incidents & live telemetry',
      icon: LayoutDashboard,
      action: () => setActiveScreen('command-center'),
    },
    {
      id: 'nav-topology',
      category: 'Navigation',
      title: 'Service Topology',
      subtitle: 'Interactive dependency graph & downstream reach',
      icon: Network,
      action: () => setActiveScreen('topology'),
    },
    {
      id: 'nav-agents',
      category: 'Navigation',
      title: 'Investigation Agents',
      subtitle: '5 autonomous agents citing verified Evidence IDs',
      icon: Bot,
      action: () => setActiveScreen('investigation'),
    },
    {
      id: 'nav-counterfactual',
      category: 'Navigation',
      title: 'Counterfactual Lab',
      subtitle: 'Structural scenario intervention do(fault = false)',
      icon: GitCompare,
      action: () => setActiveScreen('counterfactual-lab'),
    },
    {
      id: 'nav-scenarios',
      category: 'Navigation',
      title: 'Scenario Simulator',
      subtitle: 'Play, pause, reset & custom fault injection',
      icon: PlaySquare,
      action: () => setActiveScreen('scenario-simulator'),
    },
    {
      id: 'nav-evaluation',
      category: 'Navigation',
      title: 'Evaluation & Benchmark',
      subtitle: '100% Top-1 accuracy proof vs time-only baselines',
      icon: Award,
      action: () => setActiveScreen('evaluation'),
    },
    {
      id: 'nav-reports',
      category: 'Navigation',
      title: 'Incident Reports',
      subtitle: 'Post-mortem post-incident report with markdown export',
      icon: FileText,
      action: () => setActiveScreen('reports'),
    },

    // Scenarios
    {
      id: 'scen-db',
      category: 'Scenarios',
      title: 'Run PostgreSQL Pool Exhaustion',
      subtitle: 'Cascading database bottleneck affecting 4 downstream services',
      icon: Play,
      action: () => {
        startScenario('database-saturation');
        setActiveScreen('incident-workspace');
      },
      badge: 'Recommended',
    },
    {
      id: 'scen-deploy',
      category: 'Scenarios',
      title: 'Run Faulty Payment Rollout v2.4.1',
      subtitle: 'Deployment regression with 500 internal errors',
      icon: Play,
      action: () => {
        startScenario('faulty-deployment');
        setActiveScreen('incident-workspace');
      },
    },
    {
      id: 'scen-net',
      category: 'Scenarios',
      title: 'Run Network Interface Degradation',
      subtitle: 'Packet drop and transit latency spikes on API Gateway',
      icon: Play,
      action: () => {
        startScenario('network-latency');
        setActiveScreen('incident-workspace');
      },
    },
    {
      id: 'scen-pause',
      category: 'Scenarios',
      title: scenarioStatus === 'running' ? 'Pause Telemetry Playback' : 'Resume Telemetry Playback',
      subtitle: 'Toggle live scenario progression',
      icon: Pause,
      action: () => (scenarioStatus === 'running' ? pauseScenario() : startScenario()),
    },
    {
      id: 'scen-reset',
      category: 'Scenarios',
      title: 'Reset All Telemetry & Graph',
      subtitle: 'Flush events, reset services to nominal health',
      icon: RotateCcw,
      action: resetAll,
    },

    // Actions & Tools
    {
      id: 'act-ingest',
      category: 'Actions',
      title: 'Ingest Custom JSON Telemetry',
      subtitle: 'Paste raw telemetry batches or ingest distributed streams',
      icon: UploadCloud,
      action: onOpenIngest,
    },
  ], [
    setActiveScreen,
    startScenario,
    pauseScenario,
    resetAll,
    scenarioStatus,
    onOpenIngest,
  ]);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const lower = query.toLowerCase();
    return commands.filter(
      cmd =>
        cmd.title.toLowerCase().includes(lower) ||
        cmd.subtitle?.toLowerCase().includes(lower) ||
        cmd.category.toLowerCase().includes(lower)
    );
  }, [commands, query]);

  // Handle keyboard events
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filteredCommands.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Palette Modal */}
      <div className="relative w-full max-w-xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 space-x-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, screen, or scenario..."
            className="flex-1 text-sm bg-transparent border-0 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 font-medium"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-slate-100 rounded border border-slate-200">
            ESC
          </kbd>
        </div>

        {/* Command List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-50">
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No matching commands found for "{query}"
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-indigo-50 text-indigo-900'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      className={`p-1.5 rounded-lg ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900">{cmd.title}</span>
                        {cmd.badge && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 font-bold">
                            {cmd.badge}
                          </span>
                        )}
                      </div>
                      {cmd.subtitle && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5 font-normal">
                          {cmd.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-slate-400 pl-3">
                    <span className="text-[10px] font-mono uppercase">{cmd.category}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center space-x-3">
            <span><kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px]">↑</kbd> <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px]">↓</kbd> to navigate</span>
            <span><kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px]">↵</kbd> to select</span>
          </div>
          <span>J.A.R.V.I.S. Command Palette</span>
        </div>
      </div>
    </div>
  );
};

