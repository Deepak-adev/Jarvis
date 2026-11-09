import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  CartesianGrid,
} from 'recharts';
import { FactorBreakdown, NormalizedEvent } from '../engine/types';

export const FactorRadarChart: React.FC<{ factors: FactorBreakdown }> = ({ factors }) => {
  const data = [
    { subject: 'Temporal Precedence', value: Math.round(factors.temporal_precedence * 100) },
    { subject: 'Dependency Reach', value: Math.round(factors.dependency_reach * 100) },
    { subject: 'Symptom Coverage', value: Math.round(factors.symptom_coverage * 100) },
    { subject: 'Anomaly Strength', value: Math.round(factors.anomaly_strength * 100) },
    { subject: 'Cross-Signal', value: Math.round(factors.cross_signal_support * 100) },
    { subject: 'Pattern Match', value: Math.round(factors.pattern_match * 100) },
  ];

  return (
    <div className="w-full h-48 bg-slate-50/50 rounded-xl p-2 border border-slate-100">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="68%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 9.5, fontWeight: 600 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 8 }} />
          <Radar
            name="Causal Support"
            dataKey="value"
            stroke="#4f46e5"
            strokeWidth={2}
            fill="#6366f1"
            fillOpacity={0.25}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const MetricTimeSeriesChart: React.FC<{ events: NormalizedEvent[] }> = ({ events }) => {
  if (events.length === 0) {
    return (
      <div className="h-44 flex items-center justify-center text-xs text-slate-400 font-mono">
        Awaiting telemetry metric sequence...
      </div>
    );
  }

  const chartData = events.map((evt, idx) => ({
    time: `T+${idx * 3}s`,
    service: evt.service,
    anomalyValue: evt.metric_value ? Math.min(100, evt.metric_value > 10 ? evt.metric_value / 30 : evt.metric_value * 100) : 50,
    metric: evt.metric_name || 'anomaly',
  }));

  return (
    <div className="w-full h-44 bg-slate-50/60 rounded-xl p-2 border border-slate-100">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="metricGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 10, fill: '#64748b' }} />
          <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 10, fill: '#64748b' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
            labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
          />
          <Area
            type="monotone"
            dataKey="anomalyValue"
            name="Relative Anomaly Severity (%)"
            stroke="#e11d48"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#metricGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
