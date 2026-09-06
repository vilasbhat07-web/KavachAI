import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ActiveIncidentBannerProps {
  equipmentName: string;
  severity: string;
  detectedAt: string;
  incidentId: string;
}

export const ActiveIncidentBanner: React.FC<ActiveIncidentBannerProps> = ({
  equipmentName = 'GT-01 (Frame 9F)',
  severity = 'High',
  detectedAt = '12:34 PM',
  incidentId = 'GT-01-VIB',
}) => {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl border border-red-800/80 bg-gradient-to-r from-[#200f1c]/90 via-[#181126]/90 to-[#12182e]/90 p-5 shadow-xl shadow-red-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      {/* Left Icon & Main Incident Info */}
      <div className="flex items-start gap-3.5">
        <div className="h-10 w-10 rounded-full bg-red-600/20 border border-red-500/50 flex items-center justify-center text-red-400 shrink-0 mt-0.5">
          <AlertTriangle className="h-5 w-5 animate-pulse" />
        </div>

        <div className="space-y-1">
          <div className="text-[11px] font-mono uppercase tracking-wider text-red-400 font-bold flex items-center gap-2">
            <span>Active Incident</span>
          </div>

          <div className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
            High Vibration Detected
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-slate-300">
            <div>
              <span className="text-slate-400">Equipment:</span>{' '}
              <span className="text-slate-100 font-medium">{equipmentName}</span>
            </div>
            <div>
              <span className="text-slate-400">Severity:</span>{' '}
              <span className="text-red-400 font-bold">{severity}</span>
            </div>
            <div>
              <span className="text-slate-400">Detected at:</span>{' '}
              <span className="text-slate-200">{detectedAt}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Description & Action CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto justify-end">
        <div className="text-xs text-slate-300 max-w-xs leading-relaxed hidden lg:block text-right">
          Vibration levels exceeded the configured threshold. Further investigation required.
        </div>

        <button
          type="button"
          onClick={() => navigate(`/incidents/${incidentId}`)}
          className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#1a4a9c] hover:bg-[#2058b8] text-white text-xs font-semibold tracking-wide flex items-center justify-center gap-2 shadow-md shadow-blue-950/50 transition-all active:scale-[0.98] shrink-0 border border-blue-400/30"
        >
          <span>Investigate Anomaly</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};