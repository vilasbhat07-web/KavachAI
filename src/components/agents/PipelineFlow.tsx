import React from 'react';
import { ArrowRight, ShieldCheck, Activity, Eye, Brain, Lock } from 'lucide-react';

export const PipelineFlow: React.FC = () => {
  const steps = [
    {
      title: 'Modbus / OPC Stream',
      sub: '50 Hz Ingestion',
      icon: <Activity className="h-4 w-4 text-amber-400" />,
      tag: 'Sentinel',
    },
    {
      title: 'FFT & Anomaly Logic',
      sub: 'ISO 10816 Zone Check',
      icon: <Brain className="h-4 w-4 text-cyan-400" />,
      tag: 'Reasoner',
    },
    {
      title: 'Vision Defect Map',
      sub: 'YOLOv11 Bounding',
      icon: <Eye className="h-4 w-4 text-purple-400" />,
      tag: 'Vision',
    },
    {
      title: 'SIL-3 Interlock Filter',
      sub: 'Zero Override Enforced',
      icon: <Lock className="h-4 w-4 text-emerald-400" />,
      tag: 'Safety Guard',
    },
    {
      title: 'Copilot Remediation',
      sub: 'Human-in-the-Loop',
      icon: <ShieldCheck className="h-4 w-4 text-cyan-300" />,
      tag: 'Operator HUD',
    },
  ];

  return (
    <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/90 shadow-sm">
      <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
        <span>Autonomous Multi-Agent Collaborative Pipeline DAG</span>
        <span className="text-emerald-400 text-[10px]">Air-Gapped Real-Time Synchrony</span>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-2 overflow-x-auto py-1">
        {steps.map((step, idx) => (
          <React.Fragment key={idx}>
            <div className="flex-1 w-full md:w-auto p-3 rounded-lg border border-slate-800 bg-slate-900/90 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                {step.icon}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-200 truncate">{step.title}</div>
                <div className="text-[10px] text-slate-400 font-mono">{step.sub}</div>
              </div>
            </div>
            {idx < steps.length - 1 && (
              <ArrowRight className="h-4 w-4 text-slate-600 shrink-0 hidden md:block" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};