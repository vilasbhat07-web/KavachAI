import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { incidentApi } from '../../api/incidentApi';
import { Incident } from '../../types/incident';
import { useToast } from '../../context/ToastContext';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Cpu,
  ScanEye,
  FileText,
  Brain,
  ShieldCheck,
  UserCheck,
  Check,
  X,
  FileSearch,
  ExternalLink,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';

export const IncidentInvestigation: React.FC = () => {
  const { incidentId } = useParams<{ incidentId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [activeEvidenceTab, setActiveEvidenceTab] = useState<'TELEMETRY' | 'FFT' | 'VISION' | 'RAG' | 'SAFETY'>('TELEMETRY');
  const [decisionNotes, setDecisionNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    incidentApi.getIncidentById(incidentId || 'GT-01-VIB').then((data) => {
      if (data) setIncident(data);
    });
  }, [incidentId]);

  if (!incident) {
    return (
      <div className="p-6 text-center text-slate-400 font-mono">
        Loading incident investigation details...
      </div>
    );
  }

  const handleDecision = async (decision: 'APPROVED' | 'REJECTED' | 'MORE_EVIDENCE_REQUESTED') => {
    setIsProcessing(true);
    try {
      const updated = await incidentApi.recordDecision(incident.id, decision, decisionNotes);
      setIncident(updated);
      addToast({
        type: decision === 'APPROVED' ? 'success' : decision === 'REJECTED' ? 'warning' : 'info',
        title: `Operator Decision: ${decision}`,
        message:
          decision === 'APPROVED'
            ? 'Mitigation protocol approved and locked to audit ledger.'
            : decision === 'REJECTED'
            ? 'Recommendation flagged for supervisor re-evaluation.'
            : 'Additional telemetry and FFT buffers dispatched to Copilot.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStepIcon = (iconName: string) => {
    switch (iconName) {
      case 'Activity':
        return <Activity className="h-4 w-4 text-amber-400" />;
      case 'Cpu':
        return <Cpu className="h-4 w-4 text-cyan-400" />;
      case 'ScanEye':
        return <ScanEye className="h-4 w-4 text-purple-400" />;
      case 'FileText':
        return <FileText className="h-4 w-4 text-blue-400" />;
      case 'Brain':
        return <Brain className="h-4 w-4 text-emerald-400" />;
      case 'ShieldCheck':
        return <ShieldCheck className="h-4 w-4 text-orange-400" />;
      default:
        return <UserCheck className="h-4 w-4 text-cyan-300" />;
    }
  };

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto p-4 sm:p-6">
      {/* Top Breadcrumb & Incident Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0c162b] border border-[#182747] p-4 rounded-xl shadow-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/incidents')}
            className="p-1.5 rounded-lg bg-[#081021] hover:bg-[#142342] text-slate-300 hover:text-white transition border border-[#182747]"
            title="Back to Incidents"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase text-red-400 tracking-wider">
                INCIDENT INVESTIGATION
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs font-mono text-slate-300">{incident.id}</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100 mt-0.5">
              {incident.equipmentId} — {incident.title}
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-md bg-[#081021] text-slate-300 border border-[#182747]">
            Unit: {incident.equipmentName}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-red-950/80 text-red-400 border border-red-800 font-bold">
            SEVERITY: {incident.severity}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-[#10203d] text-cyan-300 border border-cyan-500/40">
            Status: {incident.status}
          </span>
        </div>
      </div>

      {/* Main Grid: Left Timeline (7 cols), Right Explainable AI + Decision (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: 7-Step Investigation Timeline */}
        <div className="lg:col-span-7 space-y-3">
          <div className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider mb-2 flex items-center justify-between">
            <span>Investigation Timeline (7-Step Decision Chain)</span>
            <span className="text-[10px] text-cyan-400">Autonomous Evidence Synthesis</span>
          </div>

          <div className="space-y-3">
            {incident.steps.map((step) => {
              const isCompleted = step.status === 'completed';
              return (
                <div
                  key={step.stepNumber}
                  className="p-4 rounded-xl bg-[#0c162b] border border-[#182747] shadow-sm space-y-2 hover:border-[#223963] transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-md bg-[#081021] border border-[#1b2f56] flex items-center justify-center shrink-0">
                        {getStepIcon(step.iconName)}
                      </div>
                      <div>
                        <div className="text-xs font-bold font-mono text-slate-100 flex items-center gap-2">
                          <span>{step.stepNumber}. {step.title}</span>
                          {isCompleted && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          )}
                        </div>
                        <div className="text-[11px] text-cyan-300 font-mono">{step.subtitle}</div>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#081021] border border-[#162744] text-slate-400">
                      Step {step.stepNumber}/7
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 font-sans leading-relaxed pl-9">
                    {step.detail}
                  </div>

                  {step.findings && step.findings.length > 0 && (
                    <div className="pl-9 space-y-1 pt-1">
                      {step.findings.map((f, i) => (
                        <div key={i} className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
                          <span className="h-1 w-1 rounded-full bg-cyan-400 shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Explainable AI Evidence & Human-In-The-Loop Decision */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card 1: Copilot Recommendation & Operator Decision (Human-in-the-loop) */}
          <div className="rounded-xl bg-[#0c162b] border border-cyan-800/60 p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-[#182747] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-bold text-slate-100 uppercase font-mono tracking-wider">
                  KAVACHA Recommendation
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px] font-mono font-bold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                <ShieldCheck className="h-3 w-3" /> SAFETY VALIDATED (SIL-3)
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#081021] border border-[#182747] text-xs text-slate-200 leading-relaxed font-sans font-medium">
              "{incident.recommendation.summary}"
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                Authorized Mitigation Sequence:
              </span>
              {incident.recommendation.actions.map((act, i) => (
                <div key={i} className="flex items-start gap-2 text-slate-300 text-[11px]">
                  <span className="text-cyan-400 font-bold shrink-0">[{i + 1}]</span>
                  <span>{act}</span>
                </div>
              ))}
            </div>

            {/* Operator Decision Section matching prompt */}
            <div className="pt-4 border-t border-[#182747] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">
                  Operator Decision (Human-in-the-Loop)
                </span>
                {incident.recommendation.operatorDecision && (
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    DECISION LOGGED
                  </span>
                )}
              </div>

              {incident.recommendation.operatorDecision ? (
                <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/80 text-xs font-mono space-y-1">
                  <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    Decision: {incident.recommendation.operatorDecision}
                  </div>
                  <div className="text-slate-400 text-[10px]">
                    Timestamp: {new Date(incident.recommendation.decisionTimestamp || '').toLocaleTimeString()} IST
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleDecision('APPROVED')}
                      className="py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition active:scale-95"
                    >
                      <Check className="h-4 w-4 stroke-[3]" />
                      <span>APPROVE</span>
                    </button>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleDecision('REJECTED')}
                      className="py-2.5 px-3 rounded-lg bg-red-950/80 hover:bg-red-900/80 border border-red-800 text-red-300 font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                    >
                      <X className="h-4 w-4" />
                      <span>REJECT</span>
                    </button>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleDecision('MORE_EVIDENCE_REQUESTED')}
                      className="py-2.5 px-3 rounded-lg bg-[#142647] hover:bg-[#1a335e] border border-cyan-500/40 text-cyan-300 font-mono font-medium text-xs flex items-center justify-center text-center transition active:scale-95 leading-tight"
                    >
                      <span>MORE EVIDENCE</span>
                    </button>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono text-center">
                    Copilot decision-support: Machinery cannot trip or derate without authenticated operator confirmation.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Explainable AI / Evidence Panel matching prompt */}
          <div className="rounded-xl bg-[#0c162b] border border-[#182747] p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-[#182747] pb-2.5">
              <span className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider flex items-center gap-2">
                <FileSearch className="h-4 w-4 text-cyan-400" />
                WHY DID KAVACHA REACH THIS CONCLUSION?
              </span>
            </div>

            {/* Evidence Selector Tabs */}
            <div className="flex flex-wrap gap-1 bg-[#081021] p-1 rounded-lg border border-[#182747] text-[10px] font-mono">
              {(['TELEMETRY', 'FFT', 'VISION', 'RAG', 'SAFETY'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveEvidenceTab(tab)}
                  className={`px-2 py-1 rounded transition ${
                    activeEvidenceTab === tab
                      ? 'bg-[#14284d] text-cyan-300 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Evidence Detail Content Viewport */}
            <div className="p-3.5 rounded-lg bg-[#081021] border border-[#15233d] font-mono text-xs space-y-2">
              {activeEvidenceTab === 'TELEMETRY' && (
                <div className="space-y-1.5">
                  <div className="text-cyan-300 font-bold text-[11px] flex justify-between">
                    <span>SENSOR: {incident.evidence.telemetry.tag}</span>
                    <span className="text-red-400">{incident.evidence.telemetry.deviation}</span>
                  </div>
                  <div className="text-slate-300 text-[11px]">
                    Measured: <span className="text-red-400 font-bold">{incident.evidence.telemetry.value}</span> (Threshold: {incident.evidence.telemetry.threshold})
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Source: Modbus TCP channel polled at 50 Hz over local loopback.
                  </div>
                </div>
              )}

              {activeEvidenceTab === 'FFT' && (
                <div className="space-y-1.5">
                  <div className="text-cyan-300 font-bold text-[11px]">
                    SPECTRAL HARMONIC ISOLATION
                  </div>
                  <div className="text-slate-300 text-[11px]">
                    Fundamental 1X: <span className="text-slate-100 font-bold">{incident.evidence.fftAnalysis.fundamentalFreq}</span>
                  </div>
                  <div className="text-slate-300 text-[11px]">
                    Energy Distribution: {incident.evidence.fftAnalysis.peakAmp}
                  </div>
                  <div className="text-[10px] text-amber-400">
                    {incident.evidence.fftAnalysis.diagnosis}
                  </div>
                </div>
              )}

              {activeEvidenceTab === 'VISION' && (
                <div className="space-y-1.5">
                  <div className="text-cyan-300 font-bold text-[11px] flex justify-between">
                    <span>{incident.evidence.computerVision.component}</span>
                    <span className="text-emerald-400">{incident.evidence.computerVision.confidence}% Certainty</span>
                  </div>
                  <div className="text-slate-200 text-[11px]">
                    Defect: <span className="text-red-400 font-semibold">{incident.evidence.computerVision.defect}</span>
                  </div>
                  <div className="text-slate-400 text-[10px]">
                    Location: {incident.evidence.computerVision.location}
                  </div>
                </div>
              )}

              {activeEvidenceTab === 'RAG' && (
                <div className="space-y-1.5">
                  <div className="text-cyan-300 font-bold text-[11px] flex justify-between">
                    <span>DOCUMENT: {incident.evidence.ragKnowledge.documentName}</span>
                    <span className="text-emerald-400">{incident.evidence.ragKnowledge.relevance}% Match</span>
                  </div>
                  <div className="text-[11px] text-slate-300 italic bg-[#0c162b] p-2 rounded border border-[#182747]">
                    "{incident.evidence.ragKnowledge.clauseExcerpt}"
                  </div>
                </div>
              )}

              {activeEvidenceTab === 'SAFETY' && (
                <div className="space-y-1.5">
                  <div className="text-emerald-400 font-bold text-[11px]">
                    SAFETY INTEGRITY LEVEL: {incident.evidence.safetyValidation.silRating} ({incident.evidence.safetyValidation.status})
                  </div>
                  <div className="text-slate-300 text-[11px]">
                    Max Permissible Ramp Rate: {incident.evidence.safetyValidation.maxRampRate}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Interlock Override: {incident.evidence.safetyValidation.overrideCheck}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};