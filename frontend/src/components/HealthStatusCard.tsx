import React from 'react';
import { CheckCircle2, XCircle, RefreshCw, Server, Cpu, Database, Activity } from 'lucide-react';
import { HealthResponse } from '../types';

interface HealthStatusCardProps {
  health: HealthResponse | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export const HealthStatusCard: React.FC<HealthStatusCardProps> = ({
  health,
  loading,
  error,
  onRefresh,
}) => {
  return (
    <div className="p-5 rounded-xl bg-surface-card border border-surface-border shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-surface-border">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Core Engine Health</h2>
            <p className="text-xs text-slate-400">Deterministic Analysis & API Status</p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Check</span>
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Status */}
        <div className="p-3 rounded-lg bg-surface/60 border border-surface-border">
          <span className="text-[11px] font-mono text-slate-400 uppercase">API Status</span>
          <div className="flex items-center space-x-2 mt-1">
            {health?.status === 'ok' ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-status-healthy" />
                <span className="text-sm font-semibold text-emerald-400">OPERATIONAL</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-status-critical" />
                <span className="text-sm font-semibold text-red-400">
                  {error ? 'DISCONNECTED' : 'CHECKING...'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* AI Provider Mode */}
        <div className="p-3 rounded-lg bg-surface/60 border border-surface-border">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Engine Mode</span>
          <div className="flex items-center space-x-2 mt-1">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-mono text-slate-200">
              {health ? health.mode.toUpperCase() : 'OFFLINE'}
            </span>
          </div>
        </div>

        {/* Version */}
        <div className="p-3 rounded-lg bg-surface/60 border border-surface-border">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Engine Version</span>
          <div className="flex items-center space-x-2 mt-1">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-mono text-slate-200">
              v{health?.version || '0.1.0'}
            </span>
          </div>
        </div>

        {/* Verified Timestamp */}
        <div className="p-3 rounded-lg bg-surface/60 border border-surface-border">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Last Sync</span>
          <div className="flex items-center space-x-2 mt-1">
            <Database className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-mono text-slate-300 truncate">
              {health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-950/40 border border-red-800/40 text-xs text-red-300 flex items-start space-x-2">
          <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Backend Unreachable</div>
            <div className="text-red-400 text-[11px] mt-0.5">{error}</div>
            <div className="text-slate-400 text-[11px] mt-1 font-mono">
              Start backend: <code className="text-slate-200">uvicorn app.main:app --port 8000</code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

