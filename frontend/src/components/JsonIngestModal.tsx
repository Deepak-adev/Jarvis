import React, { useState } from 'react';
import { useJarvis } from '../engine/context';
import { NormalizedEvent, Severity } from '../engine/types';
import { X, UploadCloud, FileCode, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

const DEFAULT_TELEMETRY_PAYLOAD = JSON.stringify([
  {
    "event_id": "ext-evt-001",
    "timestamp": new Date(Date.now() - 30000).toISOString(),
    "service": "database",
    "event_type": "resource_saturation",
    "severity": "critical",
    "message": "Custom Ingestion: PostgreSQL shared buffer evictions exceeding 95%",
    "correlation_id": "batch-stream-101",
    "metric_name": "cache_hit_ratio",
    "metric_value": 0.05,
    "attributes": { "buffer_pool_mb": 16384, "dirty_pages": 4200 }
  },
  {
    "event_id": "ext-evt-002",
    "timestamp": new Date(Date.now() - 20000).toISOString(),
    "service": "transaction-service",
    "event_type": "service_timeout",
    "severity": "error",
    "message": "Custom Ingestion: Balance verification query latency breached 4200ms",
    "correlation_id": "batch-stream-101",
    "metric_name": "query_latency_ms",
    "metric_value": 4200.0,
    "attributes": { "query": "SELECT balance FROM user_ledgers" }
  },
  {
    "event_id": "ext-evt-003",
    "timestamp": new Date(Date.now() - 10000).toISOString(),
    "service": "payment-service",
    "event_type": "error_spike",
    "severity": "critical",
    "message": "Custom Ingestion: Payment checkout processor aborted 120 client requests",
    "correlation_id": "batch-stream-101",
    "metric_name": "aborted_rate",
    "metric_value": 0.62,
    "attributes": { "reason": "TRANSACTION_ENGINE_UNAVAILABLE" }
  },
  {
    "event_id": "ext-evt-004",
    "timestamp": new Date().toISOString(),
    "service": "api-gateway",
    "event_type": "error_spike",
    "severity": "critical",
    "message": "Custom Ingestion: Public checkout endpoint returning 503 Service Unavailable",
    "correlation_id": "batch-stream-101",
    "metric_name": "http_503_count",
    "metric_value": 310.0,
    "attributes": { "route": "/api/v1/checkout" }
  }
], null, 2);

export const JsonIngestModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { events, injectCustomFault, setActiveScreen } = useJarvis();
  const [jsonText, setJsonText] = useState(DEFAULT_TELEMETRY_PAYLOAD);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const handleIngest = () => {
    setErrorMsg(null);
    setSuccessCount(null);

    try {
      const parsed = JSON.parse(jsonText);
      const items = Array.isArray(parsed) ? parsed : [parsed];

      if (items.length === 0) {
        setErrorMsg('JSON array must contain at least one telemetry event record.');
        return;
      }

      // Validate required fields
      for (const item of items) {
        if (!item.service || !item.message) {
          setErrorMsg('Each event must contain at least "service" and "message" fields.');
          return;
        }
      }

      // Ingest sequentially
      items.forEach((evt) => {
        injectCustomFault(
          evt.service,
          evt.message,
          (evt.severity as Severity) || 'error'
        );
      });

      setSuccessCount(items.length);
      setTimeout(() => {
        onClose();
        setActiveScreen('incident-workspace');
      }, 700);
    } catch (err: any) {
      setErrorMsg(`Invalid JSON Syntax: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-mono">
                INGEST CUSTOM TELEMETRY JSON
              </h3>
              <p className="text-[11px] text-slate-500 font-sans">
                Ingest distributed telemetry events or telemetry streams (FR-01 & FR-02)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-mono font-semibold text-slate-600">
              JSON EVENT PAYLOAD (ARRAY OR OBJECT)
            </label>
            <button
              type="button"
              onClick={() => setJsonText(DEFAULT_TELEMETRY_PAYLOAD)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              Reset to Standard Stream
            </button>
          </div>

          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            rows={10}
            className="w-full bg-slate-900 text-slate-100 font-mono text-xs rounded-xl p-3.5 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
            placeholder="[ { service: 'database', message: '...', severity: 'critical' } ]"
          />
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successCount !== null && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Successfully ingested {successCount} events! Navigating to Incident Workspace...</span>
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleIngest}
            className="flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Ingest & Correlate</span>
          </button>
        </div>
      </div>
    </div>
  );
};

