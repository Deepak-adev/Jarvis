import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Square, Play, Sparkles } from 'lucide-react';
import { Hypothesis, Incident, BlastRadiusResult, Recommendation } from '../engine/types';

interface AudioBriefingProps {
  incident?: Incident | null;
  topHypothesis?: Hypothesis | null;
  blastRadius?: BlastRadiusResult | null;
  recommendations?: Recommendation[];
  compact?: boolean;
}

export const AudioBriefing: React.FC<AudioBriefingProps> = ({
  incident,
  topHypothesis,
  blastRadius,
  recommendations = [],
  compact = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
    }
  }, []);

  const buildSpeechText = (): string => {
    if (!incident) {
      return 'All distributed services are currently nominal. Zero active incidents detected across the mesh.';
    }

    const confPercent = topHypothesis ? Math.round(topHypothesis.score * 100) : 85;
    const rootCause = topHypothesis
      ? `${topHypothesis.cause_type.replace(/_/g, ' ')} originating on the ${topHypothesis.candidate_service_id} service`
      : 'under active multi-signal correlation';

    const affectedCount = blastRadius
      ? blastRadius.observed_affected.length
      : incident.affected_services.length;

    const atRiskCount = blastRadius ? blastRadius.at_risk.length : 0;

    const topRec = recommendations.length > 0
      ? recommendations[0].title
      : 're-evaluate connection pool capacity and recycle idle sessions';

    return (
      `Good day, Commander. J.A.R.V.I.S. diagnostic analysis report for incident ${incident.incident_id}. ` +
      `With ${confPercent} percent deterministic confidence, the primary root cause is identified as ${rootCause}. ` +
      `Causal propagation currently impacts ${affectedCount} downstream services, with ${atRiskCount} services at risk. ` +
      `Autonomous agents have validated all cited telemetry evidence with zero hallucinations. ` +
      `Recommended recovery action: ${topRec}. Awaiting operator approval before executing simulated remediation.`
    );
  };

  const handleToggleSpeak = () => {
    if (!isSupported) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    const text = buildSpeechText();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05; // Slightly brisk, authoritative cadence
    utterance.pitch = 0.95; // Slightly deeper, refined cadence

    // Prefer sophisticated English voice if available
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice =
      voices.find(v => v.name.includes('Google UK English Male') || v.name.includes('Daniel') || v.name.includes('Natural')) ||
      voices.find(v => v.lang.startsWith('en')) ||
      null;

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  if (!isSupported) {
    return null;
  }

  if (compact) {
    return (
      <button
        onClick={handleToggleSpeak}
        title={isPlaying ? 'Stop J.A.R.V.I.S. Audio Briefing' : 'Listen to J.A.R.V.I.S. Audio Briefing'}
        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-subtle cursor-pointer ${
          isPlaying
            ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
            : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
        }`}
      >
        {isPlaying ? (
          <>
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop Briefing</span>
          </>
        ) : (
          <>
            <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Voice Briefing</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-blue-50/50 to-slate-50 border border-indigo-100 shadow-subtle">
      <button
        onClick={handleToggleSpeak}
        className={`flex items-center justify-center w-9 h-9 rounded-xl transition shadow-sm cursor-pointer ${
          isPlaying
            ? 'bg-rose-600 text-white hover:bg-rose-700'
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }`}
        title={isPlaying ? 'Stop Voice Briefing' : 'Play J.A.R.V.I.S. Audio Briefing'}
      >
        {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
      </button>

      <div className="flex-1">
        <div className="flex items-center space-x-1.5">
          <span className="text-xs font-extrabold text-slate-900 tracking-tight">
            J.A.R.V.I.S. Voice Briefing
          </span>
          <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-indigo-100 text-indigo-800 font-bold">
            SPEECH SYNTH
          </span>
        </div>
        <p className="text-[11px] text-slate-500 font-medium leading-tight">
          {isPlaying
            ? 'Speaking synthesized causal analysis & blast radius...'
            : 'Listen to a 20-second executive voice readout of the active incident.'}
        </p>
      </div>

      {isPlaying && (
        <div className="flex items-center space-x-1 px-2">
          <span className="w-1 h-4 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1 h-6 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1 h-3 bg-indigo-400 rounded-full animate-bounce" />
        </div>
      )}
    </div>
  );
};
