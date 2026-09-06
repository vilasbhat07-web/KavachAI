import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ScanEye, Activity, Terminal, MessageSquare } from 'lucide-react';
import { Modal } from '../common/Modal';
import { LiveLogTerminal } from '../agents/LiveLogTerminal';
import { MOCK_AGENT_LOGS } from '../../api/mockData';

export const QuickActionsCard: React.FC = () => {
  const navigate = useNavigate();
  const [showLogsModal, setShowLogsModal] = useState(false);

  const actions = [
    {
      title: 'View SOPs',
      icon: <BookOpen className="h-4 w-4 text-cyan-400" />,
      onClick: () => navigate('/documents'),
    },
    {
      title: 'Check Vision Feed',
      icon: <ScanEye className="h-4 w-4 text-purple-400" />,
      onClick: () => navigate('/vision'),
    },
    {
      title: 'Open Agent Analysis',
      icon: <Activity className="h-4 w-4 text-emerald-400" />,
      onClick: () => navigate('/agents'),
    },
    {
      title: 'System Logs',
      icon: <Terminal className="h-4 w-4 text-amber-400" />,
      onClick: () => setShowLogsModal(true),
    },
  ];

  return (
    <>
      <div className="rounded-xl p-4 bg-[#0c162b] border border-[#182747] flex flex-col justify-between h-full">
        <div className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider mb-2">
          Quick Actions
        </div>

        <div className="grid grid-cols-2 gap-2 my-auto">
          {actions.map((act) => (
            <button
              key={act.title}
              type="button"
              onClick={act.onClick}
              className="p-2.5 rounded-lg bg-[#091122] hover:bg-[#12203d] border border-[#182747] hover:border-cyan-500/40 text-left transition flex items-center gap-2 group"
            >
              <div className="shrink-0">{act.icon}</div>
              <span className="text-[11px] font-mono text-slate-300 group-hover:text-cyan-300 font-medium">
                {act.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* System Logs Modal */}
      <Modal
        isOpen={showLogsModal}
        onClose={() => setShowLogsModal(false)}
        title="Industrial OT Terminal Logs"
        maxWidth="2xl"
      >
        <LiveLogTerminal logs={MOCK_AGENT_LOGS} />
      </Modal>
    </>
  );
};