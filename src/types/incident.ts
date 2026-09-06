export type IncidentSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type IncidentStatus = 'Investigating' | 'Open' | 'Pending Approval' | 'Mitigated' | 'Resolved';

export interface InvestigationStep {
  stepNumber: number;
  title: string;
  subtitle: string;
  status: 'completed' | 'in_progress' | 'pending';
  iconName: string;
  detail: string;
  findings: string[];
  evidenceRef?: string;
  confidence?: number;
}

export interface IncidentEvidence {
  telemetry: {
    tag: string;
    metric: string;
    value: string;
    threshold: string;
    deviation: string;
  };
  fftAnalysis: {
    fundamentalFreq: string;
    peakAmp: string;
    subHarmonic: string;
    diagnosis: string;
  };
  computerVision: {
    component: string;
    defect: string;
    confidence: number;
    location: string;
    severity: string;
  };
  ragKnowledge: {
    documentName: string;
    section: string;
    relevance: number;
    clauseExcerpt: string;
  };
  aiReasoning: {
    rootCause: string;
    chainOfThought: string[];
  };
  safetyValidation: {
    silRating: string;
    status: 'PASSED' | 'FLAGGED';
    maxRampRate: string;
    overrideCheck: string;
  };
}

export interface Incident {
  id: string;
  title: string;
  equipmentId: string;
  equipmentName: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  detectedAt: string;
  detectedTimeStr: string;
  description: string;
  evidence: IncidentEvidence;
  recommendation: {
    summary: string;
    actions: string[];
    operatorDecision?: 'APPROVED' | 'REJECTED' | 'MORE_EVIDENCE_REQUESTED';
    decisionTimestamp?: string;
    decisionNotes?: string;
  };
  steps: InvestigationStep[];
}