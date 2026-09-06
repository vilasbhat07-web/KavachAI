import { AirGapTelemetry, ConfidenceMetrics, SecurityCertification, MachineContext } from '../types/security';
import { MOCK_AIRGAP_TELEMETRY, MOCK_CONFIDENCE_METRICS, MOCK_CERTIFICATIONS, MOCK_MACHINES } from './mockData';

export const securityApi = {
  async getAirGapStatus(): Promise<AirGapTelemetry> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return { ...MOCK_AIRGAP_TELEMETRY };
  },

  async getConfidenceMetrics(): Promise<ConfidenceMetrics> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return { ...MOCK_CONFIDENCE_METRICS };
  },

  async getCertifications(): Promise<SecurityCertification[]> {
    await new Promise((resolve) => setTimeout(resolve, 120));
    return [...MOCK_CERTIFICATIONS];
  },

  async getMachines(): Promise<MachineContext[]> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    return [...MOCK_MACHINES];
  },

  async triggerIntegrityAudit(): Promise<{ verified: boolean; sha256: string; auditDurationMs: number }> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      verified: true,
      sha256: MOCK_AIRGAP_TELEMETRY.modelSha256,
      auditDurationMs: 840,
    };
  },
};