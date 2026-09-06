import React, { useState } from 'react';
import {
  Activity,
  ScanEye,
  Brain,
  ShieldCheck,
  CheckCircle2,
  ArrowDown,
  ArrowRight,
  Radio,
  Eye,
  Lock,
  Layers,
  Terminal,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { LiveLogTerminal } from './LiveLogTerminal';
import { MOCK_AGENT_LOGS } from '../../api/mockData';

export const AgentActivity: React.FC = () => {
  const [showLogsModal, setShowLogsModal] = useState(false);

  const agents = [
    {
      id: 'sentinel',
      name: 'Telemetry Sentinel Agent',
      icon: <Activity className="h-4 w-4 text-amber-400" />,
      iconBg: 'bg-amber-950/60 border-amber-800/80',
      description: 'Monitors real-time sensor data and detects anomalies.',
      finding: 'Anomaly detected: Vibration (7.42 mm/s)',
      status: 'Completed',
    },
    {
      id: 'vision',
      name: 'Vision Defect Agent',
      icon: <ScanEye className="h-4 w-4 text-cyan-400" />,
      iconBg: 'bg-cyan-950/60 border-cyan-800/80',
      description: 'Analyzes camera and thermal images for defects.',
      finding: 'Detected: Blade crack (96% confidence)',
      status: 'Completed',
    },
    {
      id: 'reasoner',
      name: 'Diagnostic Reasoning Agent',
      icon: <Brain className="h-4 w-4 text-emerald-400" />,
      iconBg: 'bg-emerald-950/60 border-emerald-800/80',
      description: 'Correlates data from all sources and finds root cause.',
      finding: 'Possible cause: Blade fatigue',
      status: 'Completed',
    },
    {
      id: 'safety',
      name: 'Safety Interlock Agent',
      icon: <ShieldCheck className="h-4 w-4 text-orange-400" />,
      iconBg: 'bg-orange-950/60 border-orange-800/80',
      description: 'Validates recommendation against safety policies.',
      finding: 'Safety check passed (SIL-3)',
      status: 'Completed',
    },
  ];

  const percentage = 92;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="space-y-4">
      {/* Sub-Header matching reference Screen 4 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#0c162b] border border-[#182747] px-4 py-2.5 rounded-xl text-xs font-mono">
        <div className="text-slate-300 flex items-center gap-2">
          <Brain className="h-4 w-4 text-cyan-400" />
          <span className="font-semibold text-slate-100">Multi-Agent System:</span>
          <span>AI agents working together for accurate and safe diagnosis</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-800 text-emerald-400 text-[11px] font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            System Active
          </span>
          <span className="text-slate-400 text-[11px]">06 Sep 2026 | 01:10 PM</span>
        </div>
      </div>

      {/* Main Layout matching Screen 4: 7 cols Left (Agent sequence), 5 cols Right (Graph & Confidence) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: 4 Agent Cards with downward step connectors (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {agents.map((agent, idx) => (
            <React.Fragment key={agent.id}>
              <div className="rounded-xl bg-[#0c162b] border border-[#182747] p-4 shadow-md flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className={`h-9 w-9 rounded-lg border flex items-center justify-center shrink-0 ${agent.iconBg}`}>
                    {agent.icon}
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-100 font-mono">
                      {agent.name}
                    </div>
                    <div className="text-[11px] text-slate-400 font-sans leading-snug">
                      {agent.description}
                    </div>
                    <div className="text-[11px] text-cyan-300 font-mono font-medium pt-1">
                      — {agent.finding}
                    </div>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-800 text-emerald-400 text-[10px] font-mono shrink-0">
                  <CheckCircle2 className="h-3 w-3" />
                  Completed
                </span>
              </div>

              {idx < agents.length - 1 && (
                <div className="flex justify-start pl-8 my-[-4px]">
                  <ArrowDown className="h-4 w-4 text-cyan-500/60 animate-pulse" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Right Column: Agent Collaboration Graph & Overall Confidence (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card 1: Agent Collaboration Network Graph matching Screen 4 */}
          <div className="rounded-xl bg-[#0c162b] border border-[#182747] p-4 shadow-md">
            <div className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider mb-2">
              Agent Collaboration
            </div>

            {/* Circular Network Diagram */}
            <div className="relative h-44 w-full bg-[#080f20] rounded-lg border border-[#15233d] flex items-center justify-center overflow-hidden">
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 300 180">
                {/* Connecting lines between circular nodes */}
                <line x1="80" y1="50" x2="220" y2="50" stroke="#1d3461" strokeWidth="1.5" strokeDasharray="3,3" />
                <line x1="80" y1="50" x2="150" y2="90" stroke="#06b6d4" strokeWidth="2" />
                <line x1="220" y1="50" x2="150" y2="90" stroke="#3b82f6" strokeWidth="2" />
                <line x1="150" y1="90" x2="150" y2="140" stroke="#10b981" strokeWidth="2" />
              </svg>

              {/* Node 1: Telemetry (top left) */}
              <div className="absolute left-[20%] top-[20%] flex flex-col items-center">
                <div className="h-9 w-9 rounded-full bg-purple-950 border border-purple-500 flex items-center justify-center text-purple-300 shadow-md">
                  <Activity className="h-4 w-4" />
                </div>
                <span className="text-[9px] font-mono text-slate-300 mt-1">Telemetry</span>
              </div>

              {/* Node 2: Vision (top right) */}
              <div className="absolute right-[20%] top-[20%] flex flex-col items-center">
                <div className="h-9 w-9 rounded-full bg-blue-950 border border-blue-500 flex items-center justify-center text-blue-300 shadow-md">
                  <ScanEye className="h-4 w-4" />
                </div>
                <span className="text-[9px] font-mono text-slate-300 mt-1">Vision</span>
              </div>

              {/* Node 3: Reasoning (center) */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="h-10 w-10 rounded-full bg-cyan-950 border-2 border-cyan-400 flex items-center justify-center text-cyan-300 shadow-lg shadow-cyan-950/80 animate-pulse">
                  <Brain className="h-5 w-5" />
                </div>
                <span className="text-[9px] font-mono text-cyan-300 font-bold mt-1">Reasoning</span>
              </div>

              {/* Node 4: Safety (bottom center) */}
              <div className="absolute left-1/2 bottom-[10%] -translate-x-1/2 flex flex-col items-center">
                <div className="h-9 w-9 rounded-full bg-emerald-950 border border-emerald-500 flex items-center justify-center text-emerald-300 shadow-md">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <span className="text-[9px] font-mono text-slate-300 mt-1">Safety</span>
              </div>
            </div>
          </div>

          {/* Card 2: Overall Confidence Gauge & View Detailed Logs matching Screen 4 */}
          <div className="rounded-xl bg-[#0c162b] border border-[#182747] p-4 shadow-md flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">
                Overall Confidence
              </span>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                High
              </span>
            </div>

            <div className="flex items-center justify-center py-2">
              <div className="relative flex items-center justify-center">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    stroke="#152442"
                    strokeWidth="7"
                    fill="transparent"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    stroke="#06b6d4"
                    strokeWidth="7"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold font-mono text-slate-100 leading-none">
                    92%
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowLogsModal(true)}
              className="w-full py-2 rounded-lg bg-[#142340] hover:bg-[#1a2f57] border border-[#1f3764] text-cyan-300 text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition"
            >
              <span>View Detailed Logs</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Technical Logs Modal */}
      <Modal
        isOpen={showLogsModal}
        onClose={() => setShowLogsModal(false)}
        title="Multi-Agent Technical Execution Trace"
        maxWidth="2xl"
      >
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-2 text-xs font-mono p-2.5 rounded-lg bg-[#081021] border border-[#162744]">
            <div><span className="text-slate-500 text-[10px] block">LATENCY:</span> 14 ms</div>
            <div><span className="text-slate-500 text-[10px] block">MODEL:</span> Mistral-7B</div>
            <div><span className="text-slate-500 text-[10px] block">ACCURACY:</span> 99.4%</div>
            <div><span className="text-slate-500 text-[10px] block">VRAM:</span> 3,200 MB</div>
          </div>
          <LiveLogTerminal logs={MOCK_AGENT_LOGS} />
        </div>
      </Modal>
    </div>
  );
};