import React, { useState } from 'react';
import { ConfidenceMetrics } from '../../types/security';
import { ShieldCheck, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Badge } from './Badge';

interface ConfidenceGaugeProps {
  metrics: ConfidenceMetrics;
  compact?: boolean;
}

export const ConfidenceGauge: React.FC<ConfidenceGaugeProps> = ({ metrics, compact = false }) => {
  const [expanded, setExpanded] = useState(!compact);
  const score = metrics.overallScore;

  // Determine score color
  const getColor = (val: number) => {
    if (val >= 90) return { stroke: '#10b981', text: 'text-emerald-400', badge: 'success' as const };
    if (val >= 75) return { stroke: '#f59e0b', text: 'text-amber-400', badge: 'warning' as const };
    return { stroke: '#ef4444', text: 'text-red-400', badge: 'critical' as const };
  };

  const colors = getColor(score);
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/90 p-4 shadow-sm backdrop-blur-sm">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Calibrated Confidence Engine
          </span>
        </div>
        <Badge variant={colors.badge} size="xs" pulse>
          {score >= 90 ? 'Autonomous Eligible' : 'Dual Signoff Req.'}
        </Badge>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke="#1e293b"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke={colors.stroke}
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={`text-base font-bold font-mono ${colors.text}`}>
                {score.toFixed(1)}%
              </span>
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono">
                Certainty
              </span>
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-slate-200">
              {score >= 90 ? 'High Mission Certainty' : 'Advisory / Verification Mode'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 max-w-[200px] leading-tight">
              Safety threshold: <span className="font-mono text-cyan-400 font-semibold">90.0%</span> for automated execution.
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-slate-400">
              {metrics.safetyMarginPassed ? (
                <span className="inline-flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" /> SIL-3 Safety Envelope Passed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-400">
                  <AlertTriangle className="h-3 w-3" /> Safety Override Warning
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          title="Toggle Breakdown Details"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2.5">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Metric Calibration Breakdown</span>
            <span className="text-[10px] text-cyan-400">Local Bayesian Prior</span>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300">Semantic SOP Retrieval Match</span>
              <span className="font-mono text-slate-200 font-medium">{metrics.retrievalConfidence}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full transition-all duration-700"
                style={{ width: `${metrics.retrievalConfidence}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300">SCADA Telemetry Harmonic Grounding</span>
              <span className="font-mono text-slate-200 font-medium">{metrics.telemetryAlignment}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${metrics.telemetryAlignment}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300">Edge Vision Anomaly Certainty</span>
              <span className="font-mono text-slate-200 font-medium">{metrics.visionDefectCertainty}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-700"
                style={{ width: `${metrics.visionDefectCertainty}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300">Hallucination Risk Probability</span>
              <span className="font-mono text-emerald-400 font-medium">&lt;{metrics.hallucinationRisk}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full transition-all duration-700"
                style={{ width: `${metrics.hallucinationRisk * 5}%` }}
              />
            </div>
          </div>

          <div className="mt-2 p-2 rounded bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 leading-normal flex gap-2">
            <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>{metrics.rationale}</span>
          </div>
        </div>
      )}
    </div>
  );
};