import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  ShieldAlert,
  Bot,
  FileText,
  ScanEye,
  Activity,
  Lock,
  AlertTriangle,
  Cpu,
  WifiOff,
  Settings2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { hasRole } = useAuth();

  const navItems = [
    {
      to: '/',
      label: 'AI Workbench',
      icon: <Bot className="h-4 w-4" />,
    },
    {
      to: '/documents',
      label: 'Document Ingestion',
      icon: <FileText className="h-4 w-4" />,
    },
    {
      to: '/vision',
      label: 'Equipment Vision',
      icon: <ScanEye className="h-4 w-4" />,
    },
    {
      to: '/agents',
      label: 'Agent Telemetry',
      icon: <Activity className="h-4 w-4" />,
    },
    {
      to: '/security',
      label: 'Security & Air-Gap',
      icon: <Lock className="h-4 w-4" />,
    },
    { to: '/incidents', label: 'Incident Center', icon: <AlertTriangle className="h-4 w-4 text-amber-400" />, badge: 'Active' },
  ];

  const adminItems = [
    { to: '/admin', label: 'Admin Control Plane', icon: <Settings2 className="h-4 w-4" /> },
  ];

  return (
    <aside className="w-60 bg-[#080e1e] border-r border-[#15233e] flex flex-col justify-between shrink-0 select-none z-30">
      {/* Top Brand Header */}
      <div>
        <div className="px-5 py-5 border-b border-[#15233e] flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-950/50 shrink-0">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold tracking-wider text-slate-100 font-mono text-sm">
              KAVACHA
            </div>
            <div className="text-[10px] text-slate-400 font-sans tracking-tight leading-none mt-0.5">
              Air-Gapped Industrial AI Copilot
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#12284c] text-cyan-300 border border-cyan-500/40 font-semibold shadow-sm shadow-cyan-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#0d172e] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-cyan-400' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-red-950/70 text-red-400 border border-red-800/80 font-bold uppercase animate-pulse">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
        {hasRole('ADMIN') && (
          <div className="px-3 pb-4">
            <div className="mb-2 px-3 text-[9px] font-mono uppercase tracking-[0.2em] text-amber-400">Administrator</div>
            {adminItems.map((item) => {
              const isActive = location.pathname.startsWith(item.to);
              return (
                <NavLink key={item.to} to={item.to} className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-xs font-medium transition-all ${isActive ? 'bg-amber-500/10 text-amber-300 border-amber-500/40' : 'border-transparent text-slate-400 hover:bg-[#0d172e] hover:text-slate-200'}`}>
                  <span className={isActive ? 'text-amber-300' : 'text-slate-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom System Status Box matching reference */}
      <div className="p-3 border-t border-[#15233e] bg-[#070b17]">
        <div className="rounded-lg bg-[#0b1326] border border-[#1a2c4e] p-3 text-[11px] font-mono space-y-1.5">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
            System Status
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              AIR-GAPPED
            </span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
              Local LLM (vLLM)
            </span>
            <span className="text-cyan-300 font-semibold text-[10px]">
              Ready
            </span>
          </div>

          <div className="pt-1 border-t border-[#162440] flex justify-between text-[9px] text-slate-500">
            <span>Core v2.4.1</span>
            <span className="text-slate-400">Node: OT-BASTION</span>
          </div>
        </div>
      </div>
    </aside>
  );
};