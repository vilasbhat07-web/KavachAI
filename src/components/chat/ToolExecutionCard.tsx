import React, { useState } from 'react';
import { ToolCall } from '../../types/chat';
import { Terminal, ChevronDown, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from '../common/Badge';

interface ToolExecutionCardProps {
  toolCalls: ToolCall[];
}

export const ToolExecutionCard: React.FC<ToolExecutionCardProps> = ({ toolCalls }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!toolCalls || toolCalls.length === 0) return null;

  return (
    <div className="my-2.5 space-y-1.5">
      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
        <Terminal className="h-3 w-3 text-cyan-400" />
        <span>SCADA & Telemetry Tool Invocations</span>
      </div>

      <div className="space-y-1.5">
        {toolCalls.map((tool) => {
          const isExpanded = expandedId === tool.id;
          return (
            <div
              key={tool.id}
              className="rounded border border-slate-800 bg-slate-950/70 text-xs font-mono overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : tool.id)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-slate-900/60 transition"
              >
                <div className="flex items-center gap-2">
                  {tool.status === 'success' ? (
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                  )}
                  <span className="text-slate-200 font-semibold">{tool.displayName}</span>
                  <Badge variant="neutral" size="xs">
                    {tool.toolName}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="text-[10px] text-slate-500">{tool.executionTimeMs} ms</span>
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-3 py-2 border-t border-slate-800/80 bg-slate-950 text-[11px] space-y-1.5">
                  <div>
                    <span className="text-slate-500 uppercase text-[9px] block">Input Parameters:</span>
                    <pre className="text-cyan-300 overflow-x-auto p-1.5 rounded bg-slate-900/80 mt-0.5">
                      {JSON.stringify(tool.input, null, 2)}
                    </pre>
                  </div>
                  {tool.output && (
                    <div>
                      <span className="text-slate-500 uppercase text-[9px] block">Telemetry Output:</span>
                      <pre className="text-emerald-300 overflow-x-auto p-1.5 rounded bg-slate-900/80 mt-0.5">
                        {JSON.stringify(tool.output, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};