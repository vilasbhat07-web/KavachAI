import React from 'react';
import { AlertTriangle, Bell, Check, CheckCheck, Info, ShieldAlert, X } from 'lucide-react';
import { Incident } from '../../types/incident';

interface NotificationPanelProps {
  incidents: Incident[];
  readIds: string[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onViewIncident: (id: string) => void;
  onClose: () => void;
}

const severityStyles: Record<Incident['severity'], { icon: React.ReactNode; tone: string; label: string }> = {
  CRITICAL: { icon: <ShieldAlert className="h-4 w-4" />, tone: 'critical', label: 'Critical' },
  HIGH: { icon: <AlertTriangle className="h-4 w-4" />, tone: 'high', label: 'High' },
  MEDIUM: { icon: <AlertTriangle className="h-4 w-4" />, tone: 'warning', label: 'Warning' },
  LOW: { icon: <Info className="h-4 w-4" />, tone: 'info', label: 'Info' },
};

const formatDate = (value: string) =>
  new Date(value).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  incidents,
  readIds,
  onMarkRead,
  onMarkAllRead,
  onViewIncident,
  onClose,
}) => {
  const activeIncidents = incidents.filter((incident) => incident.status !== 'Resolved' && incident.status !== 'Mitigated');

  return (
    <section className="notification-panel absolute right-0 top-full mt-3 w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-xl border shadow-2xl" role="dialog" aria-label="Active alerts">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-cyan-400" />
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-main">Active Alerts</h2>
            <p className="text-[10px] text-muted">{activeIncidents.length} system events require attention</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="icon-button" aria-label="Close alerts" title="Close alerts">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="max-h-[min(60vh,420px)] overflow-y-auto p-2">
        {activeIncidents.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
            <Check className="h-8 w-8 rounded-full border border-emerald-500/40 p-1.5 text-emerald-400" />
            <p className="text-sm font-semibold text-main">No new notifications</p>
            <p className="text-xs text-muted">All monitored systems are within the current alert queue.</p>
          </div>
        ) : (
          activeIncidents.map((incident) => {
            const severity = severityStyles[incident.severity];
            const isRead = readIds.includes(incident.id);
            return (
              <div key={incident.id} className={`notification-item ${severity.tone} ${isRead ? 'is-read' : ''}`}>
                <button type="button" className="min-w-0 flex-1 text-left" onClick={() => onViewIncident(incident.id)}>
                  <div className="flex items-start gap-3">
                    <span className="notification-severity-icon" aria-hidden="true">{severity.icon}</span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-xs font-bold text-main">{incident.title}</span>
                        {!isRead && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" aria-label="Unread" />}
                      </span>
                      <span className="mt-1 block text-[11px] leading-snug text-muted">{incident.equipmentId} · {incident.description}</span>
                      <span className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-mono text-faint">
                        <span>{severity.label}</span><span>·</span><span>{formatDate(incident.detectedAt)}</span>
                      </span>
                    </span>
                  </div>
                </button>
                {!isRead && (
                  <button type="button" onClick={() => onMarkRead(incident.id)} className="icon-button shrink-0" aria-label={`Mark ${incident.title} as read`} title="Mark as read">
                    <Check className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="flex items-center justify-between border-t px-3 py-2">
        <button type="button" onClick={onMarkAllRead} className="text-[10px] font-semibold text-cyan-400 hover:text-cyan-300">
          <CheckCheck className="mr-1 inline h-3.5 w-3.5" /> Mark all as read
        </button>
        <button type="button" onClick={() => { onClose(); onViewIncident('all'); }} className="text-[10px] font-semibold text-muted hover:text-main">
          View all alerts
        </button>
      </div>
    </section>
  );
};
