import React, { useState } from 'react';
import { AgentLogEntry } from '../../types/agent';
import { Terminal, Filter, Trash2, Pause, Play, Download } from 'lucide-react';
import { Badge } from '../common/Badge';

interface LiveLogTerminalProps {
  logs: AgentLogEntry[];
}

export const LiveLogTerminal: React.FC<LiveLogTerminalProps> = ({ logs }) => {
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [paused, setPaused] = useState(false);

  const filteredLogs = logs.filter((log) => {
    if (levelFilter === 'ALL') return true;
    return log.level === levelFilter;
  });

  const getLevelColor = (level: AgentLogEntry['level']) => {
    switch (level) {
      case 'ERROR':
        return 'text-red-400 font-bold';
      case 'WARN':
        return 'text-amber-400 font-semibold';
      case 'SECURITY':
        return 'text-purple-400 font-semibold';
      case 'TELEMETRY':
        return 'text-cyan-400';
      default:
        return 'text-slate-300';
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-lg font-mono text-xs">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-slate-300">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-cyan-400" />
          <span className="font-semibold text-xs tracking-wide">
            KAVACHA AIR-GAP AGENT LOG STREAM
          </span>
          <span className="text-[10px] text-slate-500">({filteredLogs.length} events)</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[10px]">
            <Filter className="h-3 w-3 text-slate-400" />
            {['ALL', 'TELEMETRY', 'WARN', 'SECURITY', 'INFO'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevelFilter(lvl)}
                className={`px-1.5 py-0.5 rounded transition ${
                  levelFilter === lvl
                    ? 'bg-slate-800 text-cyan-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setPaused(!paused)}
            className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800 transition"
            title={paused ? 'Resume stream' : 'Pause stream'}
          >
            {paused ? <Play className="h-3.5 w-3.5 text-emerald-400" /> : <Pause className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Terminal Output */}
      <div className="p-3.5 max-h-72 overflow-y-auto space-y-1.5 bg-slate-950 text-[11px] leading-relaxed">
        {filteredLogs.map((log) => (
          <div key={log.id} className="flex items-start gap-2 hover:bg-slate-900/50 px-1 py-0.5 rounded">
            <span className="text-slate-500 shrink-0">{log.timestamp}</span>
            <span className="text-slate-400 shrink-0 font-semibold">[{log.agentCode}]</span>
            <span className={`shrink-0 text-[10px] px-1 py-0.2 rounded bg-slate-900 border border-slate-800 ${getLevelColor(log.level)}`}>
              {log.level}
            </span>
            <span className="text-slate-200 break-all">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};