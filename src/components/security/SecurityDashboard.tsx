import React, { useState } from 'react';
import {
  WifiOff,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Cpu,
  RefreshCw,
  Server,
  XCircle,
  ArrowRight,
  Factory,
  Database,
  History,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { MOCK_AGENT_LOGS } from '../../api/mockData';
import { useToast } from '../../context/ToastContext';

export const SecurityDashboard: React.FC = () => {
  const { addToast } = useToast();
  const [isAuditing, setIsAuditing] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);

  const handleRunAudit = async () => {
    setIsAuditing(true);
    addToast({
      type: 'info',
      title: 'Air-Gap Boundary Audit',
      message: 'Scanning OT network boundaries and packet filters...',
    });
    setTimeout(() => {
      setIsAuditing(false);
      setShowAuditModal(true);
      addToast({
        type: 'success',
        title: 'Audit Complete: 0 Egress Leaks',
        message: 'Cryptographic perimeter verification passed.',
      });
    }, 1000);
  };

  const securityChecklist = [
    'Network Isolation',
    'Access Control',
    'Model Integrity',
    'Audit Logging',
    'Encryption (at Rest & In Transit)',
  ];

  return (
    <div className="space-y-4">
      {/* Sub-Header matching reference Screen 5 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#0c162b] border border-[#182747] px-4 py-2.5 rounded-xl text-xs font-mono">
        <div className="text-slate-300 flex items-center gap-2">
          <Lock className="h-4 w-4 text-emerald-400" />
          <span className="font-semibold text-slate-100">Security & Air-Gap:</span>
          <span>Zero-trust security and complete data isolation</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-800 text-emerald-400 text-[11px] font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Security Status: All Systems Secure
          </span>
          <span className="text-slate-400 text-[11px]">06 Sep 2026 | 01:13 PM</span>
        </div>
      </div>

      {/* 4 Cards (2x2 Grid) matching reference Screen 5 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1: Air-Gap Status */}
        <div className="rounded-xl bg-[#0c162b] border border-[#182747] p-5 shadow-md flex items-start justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider block">
              Air-Gap Status
            </span>
            <div className="text-xl font-bold font-mono text-emerald-400">
              Enabled
            </div>
            <div className="text-xs font-mono text-slate-400">
              External Network:{' '}
              <span className="text-slate-200 font-semibold">Disconnected</span>
            </div>
          </div>

          <div className="h-10 w-10 rounded-full bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0 shadow-md">
            <WifiOff className="h-5 w-5" />
          </div>
        </div>

        {/* Card 2: Data Egress */}
        <div className="rounded-xl bg-[#0c162b] border border-[#182747] p-5 shadow-md flex items-start justify-between">
          <div className="space-y-1.5 font-mono">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Data Egress
            </span>
            <div className="text-xl font-bold text-slate-100">
              Blocked
            </div>
            <div className="text-xs text-slate-400 flex justify-between gap-6 pt-1">
              <span>Packets Attempted:</span>
              <span className="text-slate-200 font-semibold">48,920</span>
            </div>
            <div className="text-xs text-slate-400 flex justify-between gap-6">
              <span>Packets Blocked:</span>
              <span className="text-emerald-400 font-semibold">48,920</span>
            </div>
          </div>

          <div className="h-10 w-10 rounded-full bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shrink-0 shadow-md">
            <Database className="h-5 w-5" />
          </div>
        </div>

        {/* Card 3: Local AI Runtime */}
        <div className="rounded-xl bg-[#0c162b] border border-[#182747] p-5 shadow-md flex items-start justify-between">
          <div className="space-y-1.5 font-mono">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Local AI Runtime
            </span>
            <div className="text-xl font-bold text-cyan-300">
              vLLM
            </div>
            <div className="text-xs text-slate-400">
              Model: <span className="text-slate-200 font-semibold">Llama-3-8B</span>
            </div>
            <div className="text-xs text-slate-400">
              Status:{' '}
              <span className="text-emerald-400 font-semibold">Running</span>
            </div>
          </div>

          <div className="h-10 w-10 rounded-full bg-purple-950/80 border border-purple-500/50 flex items-center justify-center text-purple-400 shrink-0 shadow-md">
            <Cpu className="h-5 w-5" />
          </div>
        </div>

        {/* Card 4: Security Layers Checklist */}
        <div className="rounded-xl bg-[#0c162b] border border-[#182747] p-5 shadow-md flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider block">
              Security Layers
            </span>
            <div className="space-y-1.5 text-xs font-mono">
              {securityChecklist.map((layer) => (
                <div key={layer} className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>{layer}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Card: System Architecture (Simplified) matching reference Screen 5 */}
      <div className="rounded-xl bg-[#0c162b] border border-[#182747] p-5 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">
            System Architecture (Simplified)
          </span>

          <button
            type="button"
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#142340] hover:bg-[#1b2e54] text-cyan-300 text-xs font-mono border border-cyan-500/30 transition"
          >
            <RefreshCw className={`h-3 w-3 ${isAuditing ? 'animate-spin' : ''}`} />
            <span>{isAuditing ? 'Auditing Boundary...' : 'Run Live Security Audit'}</span>
          </button>
        </div>

        {/* Diagram Nodes Flow */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-4xl mx-auto p-4 bg-[#080f20] rounded-xl border border-[#15233d]">
          {/* Node 1: Industrial Network */}
          <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-[#0e1a33] border border-[#1b2f59] w-36 text-center">
            <Factory className="h-6 w-6 text-cyan-400" />
            <span className="text-xs font-mono font-semibold text-slate-200">
              Industrial Network
            </span>
          </div>

          <ArrowRight className="h-5 w-5 text-slate-600 shrink-0 hidden sm:block" />

          {/* Node 2: Air-Gap Firewall */}
          <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-[#0e1a33] border border-[#1b2f59] w-36 text-center">
            <ShieldCheck className="h-6 w-6 text-blue-400" />
            <span className="text-xs font-mono font-semibold text-slate-200">
              Air-Gap Firewall
            </span>
          </div>

          <ArrowRight className="h-5 w-5 text-slate-600 shrink-0 hidden sm:block" />

          {/* Node 3: Local AI Stack */}
          <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-[#0e1a33] border border-[#1b2f59] w-36 text-center">
            <Server className="h-6 w-6 text-purple-400" />
            <span className="text-xs font-mono font-semibold text-slate-200">
              Local AI Stack
            </span>
          </div>

          <ArrowRight className="h-5 w-5 text-slate-600 shrink-0 hidden sm:block" />

          {/* Node 4: No External Access (Red Cross) */}
          <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-[#200f18] border border-red-900/60 w-36 text-center">
            <XCircle className="h-6 w-6 text-red-500" />
            <span className="text-xs font-mono font-semibold text-red-400">
              No External Access
            </span>
          </div>
        </div>
      </div>

      {/* Security Audit Modal */}
      <Modal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        title="Air-Gap Cryptographic Boundary Verification"
        maxWidth="lg"
      >
        <div className="space-y-3 font-mono text-xs">
          <div className="p-3 rounded-lg bg-[#081021] border border-emerald-800/80 text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold">Zero-Exfiltration Guarantee Verified</div>
              <div className="text-[11px] text-slate-400 font-sans">
                No outbound TCP/UDP packets transmitted outside OT local loopback.
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#0a1224] border border-[#182747] space-y-1.5 text-slate-300 text-[11px]">
            <div>• SHA-256 Model Hash: 8b74c10a62df8942b012fa6b78912e8301928471928374659102938475610293 (MATCH)</div>
            <div>• WAN Interface: CABLE UNPLUGGED (PHYSICAL HARDWARE GAP)</div>
            <div>• vLLM Memory Resident: GPU 0 & 1 (Dual RTX A6000 Ada)</div>
            <div>• Data Classification: RESTRICTED AIR-GAP GOLDEN</div>
          </div>
        </div>
      </Modal>
    </div>
  );
};