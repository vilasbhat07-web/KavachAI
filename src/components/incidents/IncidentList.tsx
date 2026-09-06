import React, { useState, useEffect } from 'react';
import { incidentApi } from '../../api/incidentApi';
import { Incident } from '../../types/incident';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Flame,
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Search,
} from 'lucide-react';

export const IncidentList: React.FC = () => {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'RECENT' | 'RESOLVED'>('ACTIVE');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    incidentApi.getIncidents().then(setIncidents);
  }, []);

  const getFilteredIncidents = () => {
    return incidents.filter((inc) => {
      const matchSearch =
        inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.equipmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.equipmentId.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      if (activeTab === 'ACTIVE') {
        return inc.status === 'Investigating' || inc.status === 'Open' || inc.status === 'Pending Approval';
      }
      if (activeTab === 'RESOLVED') {
        return inc.status === 'Resolved' || inc.status === 'Mitigated';
      }
      return true; // RECENT shows all
    });
  };

  const filtered = getFilteredIncidents();

  const getSeverityBadge = (sev: Incident['severity']) => {
    switch (sev) {
      case 'HIGH':
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-800 text-red-400 text-[10px] font-mono font-bold uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
            {sev}
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-800 text-amber-400 text-[10px] font-mono font-bold uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            {sev}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-[10px] font-mono font-medium uppercase">
            {sev}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0c162b] border border-[#182747] p-3 rounded-xl">
        {/* Tabs: Active / Recent / Resolved */}
        <div className="flex items-center gap-1.5 bg-[#081021] p-1 rounded-lg border border-[#182747]">
          <button
            type="button"
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition ${
              activeTab === 'ACTIVE'
                ? 'bg-[#14284d] text-cyan-300 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Active Incidents ({incidents.filter((i) => i.status !== 'Resolved' && i.status !== 'Mitigated').length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('RECENT')}
            className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition ${
              activeTab === 'RECENT'
                ? 'bg-[#14284d] text-cyan-300 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Recent Incidents
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('RESOLVED')}
            className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition ${
              activeTab === 'RESOLVED'
                ? 'bg-[#14284d] text-cyan-300 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Resolved Incidents ({incidents.filter((i) => i.status === 'Resolved' || i.status === 'Mitigated').length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter incidents..."
            className="pl-8 pr-3 py-1.5 rounded-lg bg-[#081021] border border-[#1b2a4a] text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono w-48 sm:w-64"
          />
        </div>
      </div>

      {/* Incidents Cards List */}
      <div className="space-y-3">
        {filtered.map((inc) => (
          <div
            key={inc.id}
            className="p-5 rounded-xl bg-[#0c162b] border border-[#182747] hover:border-[#243c68] transition-all shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
          >
            <div className="flex items-start gap-4">
              <div
                className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
                  inc.severity === 'HIGH'
                    ? 'bg-red-950/60 border-red-800 text-red-400'
                    : inc.severity === 'MEDIUM'
                    ? 'bg-amber-950/60 border-amber-800 text-amber-400'
                    : 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
                }`}
              >
                {inc.severity === 'HIGH' ? (
                  <AlertTriangle className="h-5 w-5" />
                ) : inc.severity === 'MEDIUM' ? (
                  <Flame className="h-5 w-5" />
                ) : (
                  <CheckCircle2 className="h-5 w-5" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-100 text-sm group-hover:text-cyan-300 transition">
                    {inc.equipmentId} — {inc.title}
                  </span>
                  {getSeverityBadge(inc.severity)}
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#101b33] text-slate-400 border border-[#182747]">
                    Status: {inc.status}
                  </span>
                </div>

                <div className="text-xs text-slate-400 font-sans leading-snug">
                  {inc.description}
                </div>

                <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500 pt-1">
                  <span>Unit: {inc.equipmentName}</span>
                  <span>•</span>
                  <span>Detected at: {inc.detectedTimeStr}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate(`/incidents/${inc.id}`)}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#14284d] hover:bg-[#1c386b] text-cyan-300 hover:text-cyan-200 border border-cyan-500/40 text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-95 shrink-0"
            >
              <span>INVESTIGATE</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};