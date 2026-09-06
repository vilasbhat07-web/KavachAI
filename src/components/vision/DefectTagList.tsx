import React from 'react';
import { DefectDetection } from '../../types/vision';
import { AlertOctagon, AlertTriangle, ShieldCheck, CheckCircle2, BookOpen } from 'lucide-react';
import { Badge } from '../common/Badge';

interface DefectTagListProps {
  defects: DefectDetection[];
  selectedDefectId?: string;
  onSelectDefect?: (defect: DefectDetection) => void;
}

export const DefectTagList: React.FC<DefectTagListProps> = ({
  defects,
  selectedDefectId,
  onSelectDefect,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-slate-400">
        <span>Vision Anomaly Detections ({defects.length})</span>
        <span className="text-cyan-400">YOLOv11-Edge</span>
      </div>

      <div className="space-y-2.5">
        {defects.map((defect) => {
          const isSelected = defect.id === selectedDefectId;

          return (
            <div
              key={defect.id}
              onClick={() => onSelectDefect && onSelectDefect(defect)}
              className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-all ${
                isSelected
                  ? 'border-cyan-500 bg-slate-900 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-500'
                  : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-900/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  {defect.severity === 'critical' ? (
                    <AlertOctagon className="h-4 w-4 text-red-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                  )}
                  <span className="font-semibold text-slate-100">{defect.label}</span>
                </div>
                <Badge
                  variant={defect.severity === 'critical' ? 'critical' : 'warning'}
                  size="xs"
                  pulse
                >
                  {defect.confidence.toFixed(1)}%
                </Badge>
              </div>

              <div className="space-y-1 text-[11px] font-mono">
                <div className="text-slate-300">
                  <span className="text-slate-500">Location:</span> {defect.location}
                </div>
                <div className="text-cyan-300">
                  <span className="text-slate-500">Metrics:</span> {defect.metric}
                </div>
                {defect.deltaT && (
                  <div className="text-amber-400 font-semibold">
                    <span className="text-slate-500">Thermal Gradient:</span> {defect.deltaT}
                  </div>
                )}
              </div>

              <div className="mt-2.5 p-2 rounded bg-slate-900 border border-slate-800/80 text-[11px] text-slate-300 leading-relaxed">
                <span className="text-slate-400 font-medium block text-[10px] uppercase font-mono mb-0.5">
                  Remediation Action:
                </span>
                {defect.recommendation}
              </div>

              <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>Standard: {defect.standardsRef}</span>
                <span className="text-cyan-400 flex items-center gap-1">
                  <BookOpen className="h-3 w-3" /> Linked SOP
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};