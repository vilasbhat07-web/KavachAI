import React, { useState, useEffect, useRef } from 'react';
import { useCopilot } from '../../context/CopilotContext';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Bell, Lock, Cpu, Moon, Sun, UserRound, LogOut } from 'lucide-react';
import { incidentApi } from '../../api/incidentApi';
import { Incident } from '../../types/incident';
import { NotificationPanel } from '../common/NotificationPanel';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const { activeMachine } = useCopilot();
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [timeStr, setTimeStr] = useState('12:45 PM');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('kavacha-read-alerts') || '[]') as string[];
    } catch {
      return [];
    }
  });
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let isMounted = true;
    incidentApi.getIncidents().then((items) => {
      if (isMounted) setIncidents(items);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('kavacha-read-alerts', JSON.stringify(readIds));
  }, [readIds]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const activeIncidents = incidents.filter((incident) => incident.status !== 'Resolved' && incident.status !== 'Mitigated');
  const unreadCount = activeIncidents.filter((incident) => !readIds.includes(incident.id)).length;
  const markRead = (id: string) => setReadIds((current) => current.includes(id) ? current : [...current, id]);
  const markAllRead = () => setReadIds((current) => [...new Set([...current, ...activeIncidents.map((incident) => incident.id)])]);
  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const getPageTitleAndSubtitle = () => {
    const path = location.pathname;
    if (path.startsWith('/documents')) {
      return {
        title: 'Knowledge Base',
        subtitle: 'Upload and manage technical documents for RAG-based retrieval',
      };
    }
    if (path.startsWith('/vision')) {
      return {
        title: 'Equipment Vision',
        subtitle: 'Visual inspection and defect detection using computer vision',
      };
    }
    if (path.startsWith('/agents')) {
      return {
        title: 'Multi-Agent System',
        subtitle: 'AI agents working together for accurate and safe diagnosis',
      };
    }
    if (path.startsWith('/security')) {
      return {
        title: 'Security & Air-Gap',
        subtitle: 'Zero-trust security and complete data isolation',
      };
    }
    if (path.startsWith('/incidents')) {
      return {
        title: 'Incident Center',
        subtitle: 'Real-time anomaly triage, multi-source investigation and safety verification',
      };
    }
    if (path.startsWith('/admin')) {
      return {
        title: 'Admin Control Plane',
        subtitle: 'Privileged configuration and audit controls for the local runtime',
      };
    }
    return {
      title: 'AI Workbench',
      subtitle: 'Real-time monitoring and intelligent assistance for your industrial equipment',
    };
  };

  const { title, subtitle } = getPageTitleAndSubtitle();

  return (
    <header className="app-header h-16 border-b px-6 flex items-center justify-between shrink-0 z-20">
      {/* Left: Page Title & Purpose Subtitle */}
      <div>
        <h1 className="text-base font-bold text-main tracking-tight flex items-center gap-2">
          {title}
        </h1>
        <p className="text-[11px] text-muted font-normal leading-none mt-0.5">
          {subtitle}
        </p>
      </div>

      {/* Right: Active Equipment Context & Live Status Strip */}
      <div className="flex items-center gap-4">
        {/* Active Machine Context */}
        <div className="text-right hidden sm:block border-r border-app pr-4">
          <div className="text-xs font-mono font-bold text-main flex items-center justify-end gap-1.5">
            <span>GT-01 | Frame 9F</span>
          </div>
          <div className="text-[10px] text-muted font-sans leading-none mt-0.5">
            Heavy Duty Gas Turbine
          </div>
        </div>

        {/* Status Indicators matching reference */}
        <div className="flex items-center gap-2">
          {/* Online badge */}
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-800/80 text-emerald-400 text-[11px] font-mono font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Online
          </span>

          {/* Air-gapped badge */}
          <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-800/80 text-cyan-300 text-[11px] font-mono font-medium">
            <Lock className="h-3 w-3 text-cyan-400" />
            Air-Gapped
          </span>

          {/* Local AI badge */}
          <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-950/70 border border-purple-800/80 text-purple-300 text-[11px] font-mono font-medium">
            <Cpu className="h-3 w-3 text-purple-400" />
            Local AI
          </span>
        </div>

        {/* Bell & Date/Time Ticker */}
        <div className="flex items-center gap-2 pl-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-pressed={theme === 'light'}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <div className="relative" ref={notificationRef}>
          <button
            type="button"
            onClick={() => setIsNotificationsOpen((open) => !open)}
            className="icon-button relative"
            title="Active alerts"
            aria-label={`Active alerts${unreadCount ? `, ${unreadCount} unread` : ''}`}
            aria-expanded={isNotificationsOpen}
            aria-haspopup="dialog"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && <span className="notification-count">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>
          {isNotificationsOpen && (
            <NotificationPanel
              incidents={incidents}
              readIds={readIds}
              onMarkRead={markRead}
              onMarkAllRead={markAllRead}
              onViewIncident={(id) => {
                setIsNotificationsOpen(false);
                navigate(id === 'all' ? '/incidents' : `/incidents/${id}`);
              }}
              onClose={() => setIsNotificationsOpen(false)}
            />
          )}
          </div>

          <div className="relative">
            <button type="button" className="profile-trigger" onClick={() => setIsProfileOpen((open) => !open)} aria-label="Open profile menu" aria-expanded={isProfileOpen} title="Profile and sign out">
              <span className="profile-avatar"><UserRound className="h-3.5 w-3.5" /></span>
              <span className="hidden max-w-[130px] truncate text-left text-[10px] font-medium text-main md:block">{user?.name}</span>
            </button>
            {isProfileOpen && (
              <div className="profile-menu" role="menu">
                <div className="border-b border-app px-3 py-2">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">{user?.role} access</p>
                  <p className="mt-1 truncate text-xs text-main">{user?.email}</p>
                </div>
                <button type="button" className="profile-menu-action" onClick={handleLogout} role="menuitem">
                  <LogOut className="h-3.5 w-3.5" /> Sign out
                </button>
              </div>
            )}
          </div>

          <div className="text-[11px] font-mono text-muted hidden xl:block">
            06 Sep 2026 | {timeStr}
          </div>
        </div>
      </div>
    </header>
  );
};