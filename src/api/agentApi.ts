import { IndustrialAgent, AgentTask, AgentLogEntry } from '../types/agent';
import { MOCK_AGENTS, MOCK_AGENT_TASKS, MOCK_AGENT_LOGS } from './mockData';

let agentsStore: IndustrialAgent[] = [...MOCK_AGENTS];
let tasksStore: AgentTask[] = [...MOCK_AGENT_TASKS];
let logsStore: AgentLogEntry[] = [...MOCK_AGENT_LOGS];

export const agentApi = {
  async getAgents(): Promise<IndustrialAgent[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return [...agentsStore];
  },

  async getTasks(): Promise<AgentTask[]> {
    await new Promise((resolve) => setTimeout(resolve, 120));
    return [...tasksStore];
  },

  async getLogs(): Promise<AgentLogEntry[]> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    return [...logsStore];
  },

  async triggerTask(agentId: string, title: string): Promise<AgentTask> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const agent = agentsStore.find((a) => a.id === agentId);
    const newTask: AgentTask = {
      id: 'task-' + Date.now(),
      agentId,
      agentName: agent ? agent.name : 'Autonomous Agent',
      title,
      priority: 'high',
      status: 'running',
      progress: 25,
      startedAt: new Date().toISOString(),
      estimatedCompletion: 'In 6s',
      traceSteps: [
        'Dispatched on-prem execution payload to local agent daemon',
        'Allocated dedicated VRAM slice (2,048 MB)',
        'Synthesizing live SCADA Modbus stream',
      ],
    };
    tasksStore.unshift(newTask);

    logsStore.unshift({
      id: 'log-' + Date.now(),
      timestamp: new Date().toLocaleTimeString() + '.012',
      agentCode: agent ? agent.codeName : 'AGENT-LOCAL',
      level: 'INFO',
      message: `Dispatched autonomous diagnostic task: "${title}". Air-gap boundaries active.`,
    });

    return newTask;
  },
};