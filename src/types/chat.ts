import { VectorChunk } from './document';

export interface ReasoningStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'flagged';
  durationMs?: number;
  timestamp: string;
}

export interface ToolCall {
  id: string;
  toolName: 'scada_telemetry_query' | 'vibration_fft_spectrum' | 'sop_vector_search' | 'schematic_lookup' | 'safety_interlock_check';
  displayName: string;
  status: 'running' | 'success' | 'warning' | 'error';
  executionTimeMs: number;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
}

export interface MessageCitation {
  id: string;
  documentId: string;
  documentName: string;
  page?: number;
  section: string;
  snippet: string;
  relevanceScore: number;
  pAndIdTag?: string;
  sha256: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  machineId?: string;
  reasoningSteps?: ReasoningStep[];
  toolCalls?: ToolCall[];
  citations?: MessageCitation[];
  confidenceScore?: number;
  safetyAlertLevel?: 'nominal' | 'advisory' | 'warning' | 'critical';
}

export interface PromptPreset {
  id: string;
  title: string;
  description: string;
  category: 'vibration' | 'thermal' | 'sop' | 'compliance';
  machineId: string;
  prompt: string;
  badge: string;
}
