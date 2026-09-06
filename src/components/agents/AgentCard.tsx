import React from 'react';
import { IndustrialAgent } from '../../types/agent';
import { Activity, Cpu, Zap, CheckCircle2, AlertTriangle, Play } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface AgentCardProps {
  agent: IndustrialAgent;
  onTrigger: (agentId: string) => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, onTrigger }) => {
  const getStatusBadge = (status: IndustrialAgent['status']) => {
    switch (status) {
      case 'alert':
        return <Badge variant="critical" size="xs" pulse>Anomaly Tripped</Badge>;
      case 'executing':
        return <Badge variant="cyan" size="xs" pulse>Inferencing</Badge>;
      case 'active':
        return <Badge variant="success" size="xs">Sentinel Active</Badge>;
      default:
        return <Badge variant="neutral" size="xs">Standby</Badge>;
    }
  };

  return (
    <div className="flex flex-col justify-between p-4 rounded-xl border border-slate-800 bg-slate-900/80 shadow-sm hover:border-slate-700 transition">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400">
              <Cpu className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100">{agent.name}</div>
              <div className="text-[10px] font-mono text-slate-500">{agent.codeName}</div>
            </div>
          </div>
          <div>{getStatusBadge(agent.status)}</div>
        </div>

        <div className="text-[11px] text-slate-400 leading-relaxed my-2 line-clamp-2">
          {agent.description}
        </div>

        {/* Telemetry Metrics */}
        <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[11px] font-mono">
          <div>
            <span className="text-slate-500 block text-[9px] uppercase">VRAM Slice:</span>
            <span className="text-cyan-300 font-semibold">{agent.vramMb} MB</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[9px] uppercase">Latency:</span>
            <span className="text-slate-200 font-semibold">{agent.latencyMs} ms</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[9px] uppercase">Telemetry Ops:</span>
            <span className="text-slate-200 font-semibold">{agent.opsCount.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[9px] uppercase">Accuracy:</span>
            <span className="text-emerald-400 font-semibold">{agent.accuracyRate}%</span>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {agent.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60"
            >
              {tag}
            </span>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onTrigger(agent.id)}
          icon={<Play className="h-3 w-3" />}
        >
          Run Pulse
        </Button>
      </div>
    </div>
  );
};