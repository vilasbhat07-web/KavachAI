import React, { useState } from 'react';
import { ReasoningStep } from '../../types/chat';
import { Brain, CheckCircle2, ChevronDown, ChevronRight, Clock, Loader2 } from 'lucide-react';
import { Badge } from '../common/Badge';

interface ReasoningChainProps {
  steps: ReasoningStep[];
}

export const ReasoningChain: React.FC<ReasoningChainProps> = ({ steps }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!steps || steps.length === 0) return null;

  return (
    <div className="my-2.5 rounded-lg border border-slate-800 bg-slate-950/60 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2 text-left hover:bg-slate-900/60 transition"
      >
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-mono font-medium text-slate-300">
            Autonomous Reasoning Trace ({steps.length} steps)
          </span>
          <Badge variant="cyan" size="xs">
            Air-Gapped CoT
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-[10px] font-mono text-slate-500">
            Total: {steps.reduce((acc, s) => acc + (s.durationMs || 0), 0)} ms
          </span>
          {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </div>
      </button>

      {isOpen && (
        <div className="px-3.5 py-3 border-t border-slate-800/80 space-y-2.5">
          {steps.map((step, idx) => (
            <div key={step.id || idx} className="flex items-start gap-2.5 text-xs">
              <div className="mt-0.5 shrink-0">
                {step.status === 'completed' ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                ) : step.status === 'running' ? (
                  <Loader2 className="h-3.5 w-3.5 text-cyan-400 animate-spin" />
                ) : (
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">{step.title}</span>
                  {step.durationMs && (
                    <span className="font-mono text-[10px] text-slate-500">
                      {step.durationMs} ms
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  {step.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};