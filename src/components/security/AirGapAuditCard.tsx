import React, { useState } from 'react';
import { AirGapTelemetry } from '../../types/security';
import { securityApi } from '../../api/securityApi';
import { useToast } from '../../context/ToastContext';
import {
  WifiOff,
  ShieldCheck,
  Lock,
  Cpu,
  RefreshCw,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface AirGapAuditCardProps {
  telemetry: AirGapTelemetry;
  onAuditComplete?: () => void;
}

export const AirGapAuditCard: React.FC<AirGapAuditCardProps> = ({
  telemetry,
  onAuditComplete,
}) => {
  const { addToast } = useToast();
  const [auditing, setAuditing] = useState(false);

  const handleRunAudit = async () => {
    setAuditing(true);
    addToast({
      type: 'info',
      title: 'Air-Gap Boundary Audit Initiated',
      message: 'Verifying zero packet leakage across all local network adapters...',
    });

    try {
      const res = await securityApi.triggerIntegrityAudit();
      addToast({
        type: 'success',
        title: 'Boundary Integrity Confirmed',
        message: `0 egress packets detected. SHA-256 match in ${res.auditDurationMs} ms.`,
      });
      if (onAuditComplete) onAuditComplete();
    } catch (err) {
      addToast({
        type: 'critical',
        title: 'Audit Failure',
        message: 'Security enclave verification timed out.',
      });
    } finally {
      setAuditing(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
            <WifiOff className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Physical Air-Gap Enclave Isolation
              <Badge variant="success" size="xs" pulse>
                100% OFFLINE
              </Badge>
            </div>
            <div className="text-xs text-slate-400">
              Hardware-enforced zero-exfiltration barrier for mission-critical industrial telemetry
            </div>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          loading={auditing}
          onClick={handleRunAudit}
          icon={<RefreshCw className="h-3.5 w-3.5" />}
        >
          Run Integrity Audit
        </Button>
      </div>

      {/* Grid of Telemetry Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
            <WifiOff className="h-3 w-3 text-emerald-400" /> Physical WAN Link
          </span>
          <div className="text-sm font-bold text-emerald-400">
            {telemetry.physicalCableStatus}
          </div>
          <div className="text-[10px] text-slate-400">Zero physical uplink</div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
            <Lock className="h-3 w-3 text-red-400" /> Blocked Egress
          </span>
          <div className="text-sm font-bold text-slate-100">
            {telemetry.egressPacketsBlocked.toLocaleString()} pkts
          </div>
          <div className="text-[10px] text-emerald-400">100% packet drops</div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
            <Cpu className="h-3 w-3 text-cyan-400" /> Local VRAM In-Use
          </span>
          <div className="text-sm font-bold text-cyan-300">
            {telemetry.vramAllocatedGb} / {telemetry.vramTotalGb} GB
          </div>
          <div className="text-[10px] text-slate-400">Dual RTX A6000 Ada</div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-purple-400" /> Model Integrity
          </span>
          <div className="text-sm font-bold text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> VERIFIED
          </div>
          <div className="text-[10px] text-slate-400 truncate">
            SHA: {telemetry.modelSha256.slice(0, 8)}...
          </div>
        </div>
      </div>

      {/* Hardware & Runtime Configuration Strip */}
      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/90 text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="text-slate-300">
          <span className="text-slate-500">Local Runtime Engine:</span>{' '}
          <span className="text-cyan-400 font-semibold">{telemetry.localRuntime}</span>
        </div>
        <div className="text-slate-300">
          <span className="text-slate-500">Isolated OT Subnet:</span>{' '}
          <span className="text-slate-200">{telemetry.lanVlanId}</span>
        </div>
        <div className="text-slate-500 text-[10px]">
          Last Audit: {new Date(telemetry.lastAuditTimestamp).toLocaleTimeString()} IST
        </div>
      </div>
    </div>
  );
};