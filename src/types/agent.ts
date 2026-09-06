export type AgentStatus = 'active' | 'standby' | 'alert' | 'executing';

export interface IndustrialAgent {
  id: string;
  name: string;
  codeName: string;
  role: string;
  description: string;
  status: AgentStatus;
  vramMb: number;
  latencyMs: number;
  opsCount: number;
  accuracyRate: number;
  lastExecution: string;
  tags: string[];
}

export interface AgentTask {
  id: string;
  agentId: string;
  agentName: string;
  title: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'queued' | 'running' | 'completed' | 'interrupted';
  progress: number;
  startedAt: string;
  estimatedCompletion: string;
  traceSteps: string[];
}

export interface AgentLogEntry {
  id: string;
  timestamp: string;
  agentCode: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'TELEMETRY' | 'SECURITY';
  message: string;
  payload?: Record<string, unknown>;
}
