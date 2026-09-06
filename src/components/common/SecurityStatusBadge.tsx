import React, { useState } from 'react';
import { Shield, Lock, WifiOff, Cpu, CheckCircle2 } from 'lucide-react';
import { Badge } from './Badge';

interface SecurityStatusBadgeProps {
  onAuditClick?: () => void;
  compact?: boolean;
}

export const SecurityStatusBadge: React.FC<SecurityStatusBadgeProps> = ({
  onAuditClick,
  compact = false,
}) => {
  const [showPopover, setShowPopover] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setShowPopover(!showPopover)}
        className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-700/60 hover:border-emerald-600 transition-colors shadow-sm group select-none"
        title="Air-Gap Enclave Isolation Status"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>

        <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-300">
          <WifiOff className="h-3.5 w-3.5 text-emerald-400" />
          <span>AIR-GAPPED</span>
          {!compact && (
            <span className="text-[10px] px-1 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700/50">
              0 EGRESS
            </span>
          )}
        </div>
      </button>

      {showPopover && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setShowPopover(false)}
          />
          <div className="absolute right-0 mt-2 w-80 rounded-lg border border-slate-800 bg-slate-900 p-4 shadow-xl z-40 text-left">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200 uppercase font-mono">
                  Air-Gap Security Boundary
                </span>
              </div>
              <Badge variant="success" size="xs">
                LEVEL 4 ISOLATED
              </Badge>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <WifiOff className="h-3 w-3 text-red-400" /> Physical WAN Link:
                </span>
                <span className="font-mono text-emerald-400 font-medium">DISCONNECTED</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Lock className="h-3 w-3 text-cyan-400" /> Blocked Egress Packets:
                </span>
                <span className="font-mono text-slate-200 font-medium">48,920 (100% Drops)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Cpu className="h-3 w-3 text-purple-400" /> On-Prem Runtime:
                </span>
                <span className="font-mono text-slate-200 font-medium">vLLM (Dual A6000 Ada)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Model Integrity:
                </span>
                <span className="font-mono text-emerald-400 font-medium">SHA-256 VERIFIED</span>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setShowPopover(false);
                  if (onAuditClick) onAuditClick();
                }}
                className="w-full text-center text-xs font-medium text-cyan-400 hover:text-cyan-300 py-1.5 rounded bg-slate-800/80 hover:bg-slate-800 transition"
              >
                Open Full Security & Compliance Audit &rarr;
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};