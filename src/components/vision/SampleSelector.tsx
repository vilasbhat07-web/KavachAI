import React from 'react';
import { EquipmentImageSample } from '../../types/vision';
import { Camera, Flame, Layers } from 'lucide-react';
import { Badge } from '../common/Badge';

interface SampleSelectorProps {
  samples: EquipmentImageSample[];
  selectedSampleId: string;
  onSelect: (sample: EquipmentImageSample) => void;
}

export const SampleSelector: React.FC<SampleSelectorProps> = ({
  samples,
  selectedSampleId,
  onSelect,
}) => {
  return (
    <div className="space-y-2">
      <div className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Camera className="h-3.5 w-3.5 text-cyan-400" />
          Preloaded Industrial Inspection Scenarios
        </span>
        <span className="text-[10px] text-cyan-400">One-Click Testing</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {samples.map((sample) => {
          const isSelected = sample.id === selectedSampleId;
          const criticalCount = sample.defects.filter((d) => d.severity === 'critical').length;

          return (
            <button
              key={sample.id}
              type="button"
              onClick={() => onSelect(sample)}
              className={`flex flex-col text-left p-3 rounded-lg border transition-all duration-150 ${
                isSelected
                  ? 'border-cyan-500 bg-slate-900 shadow-md shadow-cyan-950/40'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="font-mono text-[10px] text-slate-400 font-bold uppercase">
                  {sample.machineId}
                </span>
                <Badge variant={criticalCount > 0 ? 'critical' : 'warning'} size="xs" pulse>
                  {sample.defects.length} Anomalies
                </Badge>
              </div>

              <div className="text-xs font-semibold text-slate-100 line-clamp-1">
                {sample.title}
              </div>

              <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                <span>{sample.component}</span>
                <span className="font-mono text-cyan-400 uppercase">
                  {sample.imageType}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};