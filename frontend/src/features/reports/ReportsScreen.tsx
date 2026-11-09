import React, { useState } from 'react';
import { useJarvis } from '../../engine/context';
import { 
  FileText, 
  Download, 
  Copy, 
  Check, 
  ShieldCheck, 
  Clock, 
  Layers, 
  AlertTriangle,
  Printer
} from 'lucide-react';

export const ReportsScreen: React.FC = () => {
  const {
    activeIncident,
    events,
    hypotheses,
    evidenceList,
    blastRadius,
    recommendations,
  } = useJarvis();

  const [copied, setCopied] = useState(false);

  if (!activeIncident) {
    return (
      <div className="py-24 text-center space-y-3 max-w-md mx-auto">
        <FileText className="w-12 h-12 text-slate-400 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">No Incident Report Available</h3>
        <p className="text-xs text-slate-500">
          Run an incident scenario from the Command Center to generate an automated post-mortem report.
        </p>
      </div>
    );
  }

  const topHyp = hypotheses[0];
  const incidentEvents = events.filter(e => activeIncident.event_ids.includes(e.event_id));

  const generateMarkdown = () => {
    return `# INCIDENT POST-MORTEM REPORT: ${activeIncident.incident_id}
**Title:** ${activeIncident.title}  
**Status:** ${activeIncident.status.toUpperCase()}  
**Severity:** ${activeIncident.severity.toUpperCase()}  
**Time Window:** ${activeIncident.started_at} to ${activeIncident.last_updated_at}  

---

## 1. Executive Summary
During the evaluated operational window, a cascading degradation occurred across ${activeIncident.affected_services.length} services (${activeIncident.affected_services.join(', ')}). 
The deterministic causal engine identified **${topHyp?.candidate_service_id || 'Unknown'}** as the most probable initiating root cause with **${Math.round((topHyp?.score || 0) * 100)}%** heuristic support score.

---

## 2. Root Cause Analysis
- **Candidate Service:** ${topHyp?.candidate_service_id}
- **Fault Signature:** ${topHyp?.cause_type}
- **Confidence Rating:** ${topHyp?.support_label} (${Math.round((topHyp?.score || 0) * 100)}%)
- **Temporal Precedence:** ${Math.round((topHyp?.factor_breakdown.temporal_precedence || 0) * 100)}%
- **Downstream Reach:** ${Math.round((topHyp?.factor_breakdown.dependency_reach || 0) * 100)}%
- **Symptom Coverage:** ${Math.round((topHyp?.factor_breakdown.symptom_coverage || 0) * 100)}%
- **Caveat:** ${topHyp?.caveat}

---

## 3. Impact & Blast Radius
- **Observed Failing Services:** ${blastRadius?.observed_affected.join(', ') || 'N/A'}
- **Downstream At-Risk Services:** ${blastRadius?.at_risk.join(', ') || 'N/A'}
- **Overall Impact Score:** ${Math.round((blastRadius?.impact_score || 0) * 100)}%

---

## 4. Chronological Telemetry Sequence
${incidentEvents.map((e, idx) => `${idx + 1}. [${e.timestamp}] [${e.service}] (${e.severity.toUpperCase()}): ${e.message}`).join('\n')}

---

## 5. Correlated Evidence Objects
${evidenceList.map(ev => `- [${ev.evidence_id}] ${ev.summary} (Relevance: ${Math.round(ev.relevance * 100)}%)`).join('\n')}

---

## 6. Recommended Next Steps
${recommendations.map(r => `- **${r.title}** (Target: ${r.target_service}, Risk: ${r.risk_level.toUpperCase()}): ${r.description}`).join('\n')}
`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([generateMarkdown()], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `incident-report-${activeIncident.incident_id}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-4 shadow-subtle">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2 font-mono">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>INCIDENT POST-MORTEM REPORT</span>
          </h2>
          <p className="text-xs text-slate-500 font-sans">
            Audit-ready export combining deterministic causal reasoning, telemetry logs, and agent findings
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition shadow-subtle cursor-pointer"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Print / PDF</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition shadow-subtle cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Markdown'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export .MD</span>
          </button>
        </div>
      </div>

      {/* Rendered Report Document (Crisp White Paper) */}
      <div className="p-8 rounded-2xl bg-white border border-slate-200 space-y-6 shadow-card font-sans text-slate-800">
        <div className="border-b border-slate-200 pb-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-wider">
              OFFICIAL INCIDENT REPORT
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 mt-1">{activeIncident.title}</h1>
          </div>
          <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-mono uppercase font-bold">
            {activeIncident.severity}
          </span>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-1.5 font-mono uppercase tracking-wide">
            1. Executive Summary
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed">
            During the evaluated operational window, a cascading degradation affected {activeIncident.affected_services.length} services ({activeIncident.affected_services.join(', ')}). The deterministic causal engine identified <strong className="text-indigo-700 font-bold">{topHyp?.candidate_service_id}</strong> as the primary initiating root cause with a <strong className="text-emerald-700 font-bold">{Math.round((topHyp?.score || 0) * 100)}%</strong> heuristic support score.
          </p>
        </div>

        {/* Root Cause Details */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-1.5 font-mono uppercase tracking-wide">
            2. Primary Root-Cause Analysis
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-slate-50/80 p-4 rounded-xl border border-slate-200">
            <div>Candidate Service: <strong className="text-indigo-700">{topHyp?.candidate_service_id}</strong></div>
            <div>Fault Signature: <span className="text-slate-800 font-semibold">{topHyp?.cause_type}</span></div>
            <div>Temporal Fit: <span className="text-slate-800">{Math.round((topHyp?.factor_breakdown.temporal_precedence || 0) * 100)}%</span></div>
            <div>Downstream Coverage: <span className="text-slate-800">{Math.round((topHyp?.factor_breakdown.symptom_coverage || 0) * 100)}%</span></div>
          </div>
        </div>

        {/* Chronological Sequence */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-1.5 font-mono uppercase tracking-wide">
            3. Chronological Incident Sequence
          </h3>
          <div className="space-y-2 font-mono text-xs">
            {incidentEvents.map((evt, idx) => (
              <div key={evt.event_id} className="p-3 rounded-xl bg-slate-50/60 border border-slate-200/70 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 font-bold mr-2">{idx + 1}.</span>
                  <span className="text-slate-900 font-bold mr-2">[{evt.service}]</span>
                  <span className="text-slate-700 font-sans">{evt.message}</span>
                </div>
                <span className="text-slate-400 text-[11px] flex-shrink-0">
                  {new Date(evt.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Recommendations */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-1.5 font-mono uppercase tracking-wide">
            4. Recommended Remediation Runbooks
          </h3>
          <div className="space-y-2.5">
            {recommendations.map(r => (
              <div key={r.recommendation_id} className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-200 text-xs">
                <div className="font-bold text-slate-900">{r.title}</div>
                <div className="text-slate-600 text-xs mt-0.5 font-sans leading-relaxed">{r.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
