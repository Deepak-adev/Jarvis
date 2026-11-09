import React from 'react';
import { 
  Home,
  LayoutDashboard, 
  AlertTriangle, 
  Network, 
  GitCompare, 
  Bot, 
  PlaySquare, 
  FileText,
  Award,
  ShieldCheck,
  ChevronRight,
  PanelLeftClose
} from 'lucide-react';
import { useJarvis } from '../engine/context';

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { activeScreen, setActiveScreen, incidents } = useJarvis();

  const navItems = [
    { id: 'home', label: 'Home / Overview', icon: Home },
    { id: 'command-center', label: 'Command Center', icon: LayoutDashboard },
    { 
      id: 'incident-workspace', 
      label: 'Incident Workspace', 
      icon: AlertTriangle, 
      badge: incidents.length > 0 ? incidents.length : null,
      primary: true,
    },
    { id: 'topology', label: 'Service Topology', icon: Network },
    { id: 'investigation', label: 'Investigation Agents', icon: Bot },
    { id: 'counterfactual-lab', label: 'Counterfactual Lab', icon: GitCompare },
    { id: 'scenario-simulator', label: 'Scenario Simulator', icon: PlaySquare },
    { id: 'evaluation', label: 'Evaluation & Benchmark', icon: Award },
    { id: 'reports', label: 'Incident Reports', icon: FileText },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-4 select-none flex-shrink-0 shadow-subtle transition-all duration-200">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-3 py-1 mb-1">
          <span className="text-[11px] font-mono tracking-wider text-slate-400 uppercase font-semibold">
            Platform Views
          </span>
          {onClose && (
            <button
              onClick={onClose}
              title="Close sidebar"
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveScreen(item.id)}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-subtle'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-600 text-white animate-pulse shadow-sm">
                  {item.badge}
                </span>
              ) : isActive ? (
                <ChevronRight className="w-3.5 h-3.5 text-indigo-500" />
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Core Guarantee Card */}
      <div className="p-4 rounded-xl bg-gradient-to-b from-slate-50 to-indigo-50/30 border border-slate-200/80 text-xs text-slate-600 space-y-2">
        <div className="flex items-center space-x-1.5 text-indigo-700 font-semibold text-[11px]">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>Deterministic Source of Truth</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-500">
          Root cause ranking and counterfactuals are mathematically computed. Autonomous agents gather evidence and challenge hypotheses.
        </p>
      </div>
    </aside>
  );
};
