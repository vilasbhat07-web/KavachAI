import React from 'react';
import { IngestionPipelineStage } from '../../types/document';
import { CheckCircle2, Loader2, Clock, ShieldCheck } from 'lucide-react';

interface IngestionPipelineProps {
  stages: IngestionPipelineStage[];
}

export const IngestionPipeline: React.FC<IngestionPipelineProps> = ({ stages }) => {
  if (!stages || stages.length === 0) return null;

  return (
    <div className="rounded-xl border border-cyan-900/60 bg-slate-950/90 p-4 shadow-md space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-200 uppercase font-mono tracking-wider">
            Air-Gapped Embedding & Indexing Pipeline
          </span>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 animate-pulse">
          Processing On-Prem...
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {stages.map((stage) => {
          const isDone = stage.status === 'completed';
          const isRunning = stage.status === 'running';

          return (
            <div
              key={stage.id}
              className={`p-2.5 rounded-lg border text-xs font-mono transition-all ${
                isDone
                  ? 'border-emerald-800/80 bg-emerald-950/20 text-emerald-300'
                  : isRunning
                  ? 'border-cyan-700 bg-cyan-950/30 text-cyan-200 shadow-sm'
                  : 'border-slate-800 bg-slate-900/40 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-[11px] truncate">{stage.name}</span>
                {isDone ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                ) : isRunning ? (
                  <Loader2 className="h-3.5 w-3.5 text-cyan-400 animate-spin shrink-0" />
                ) : (
                  <Clock className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                )}
              </div>

              <div className="text-[10px] text-slate-400 leading-tight mb-2 line-clamp-2">
                {stage.description}
              </div>

              {/* Progress bar */}
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isDone ? 'bg-emerald-500' : isRunning ? 'bg-cyan-400' : 'bg-transparent'
                  }`}
                  style={{ width: `${stage.progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};