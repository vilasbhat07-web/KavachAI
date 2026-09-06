export interface MachineContext {
  id: string;
  tag: string;
  name: string;
  plantArea: string;
  type: string;
  status: 'nominal' | 'warning' | 'critical' | 'maintenance';
  currentRpm: number;
  temperatureC: number;
  pressureBar: number;
  vibrationMmS: number;
  lastInspection: string;
  silRating: 'SIL-2' | 'SIL-3' | 'SIL-4';
}

export interface AirGapTelemetry {
  airGapIsolated: boolean;
  physicalCableStatus: 'DISCONNECTED' | 'CONNECTED';
  egressPacketsBlocked: number;
  inboundPacketsBlocked: number;
  wanBytesSent: number;
  localLoopbackBytes: number;
  lanVlanId: string;
  localRuntime: string;
  gpuDevice: string;
  vramAllocatedGb: number;
  vramTotalGb: number;
  modelChecksumVerified: boolean;
  modelSha256: string;
  lastAuditTimestamp: string;
}

export interface ConfidenceMetrics {
  overallScore: number;
  retrievalConfidence: number;
  telemetryAlignment: number;
  visionDefectCertainty: number;
  hallucinationRisk: number;
  safetyMarginPassed: boolean;
  requiresDualSignoff: boolean;
  rationale: string;
}

export interface SecurityCertification {
  standard: string;
  title: string;
  status: 'VERIFIED' | 'COMPLIANT' | 'AUDITED';
  clause: string;
  lastVerified: string;
}
