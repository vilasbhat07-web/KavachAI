import React, { useState } from 'react';
import { EquipmentImageSample, DefectDetection } from '../../types/vision';
import { Eye, EyeOff, ZoomIn, ZoomOut, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '../common/Badge';

interface ImageCanvasViewerProps {
  sample: EquipmentImageSample;
  onSelectDefect?: (defect: DefectDetection) => void;
  selectedDefectId?: string;
}

export const ImageCanvasViewer: React.FC<ImageCanvasViewerProps> = ({
  sample,
  onSelectDefect,
  selectedDefectId,
}) => {
  const [showBoxes, setShowBoxes] = useState(true);
  const [hoveredDefect, setHoveredDefect] = useState<DefectDetection | null>(null);

  const getSeverityBorder = (sev: string) => {
    switch (sev) {
      case 'critical':
        return 'border-red-500 bg-red-500/10 shadow-red-500/30';
      case 'warning':
        return 'border-amber-500 bg-amber-500/10 shadow-amber-500/30';
      default:
        return 'border-emerald-500 bg-emerald-500/10';
    }
  };

  return (
    <div className="flex flex-col h-full rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-lg">
      {/* Control Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-900/90 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-slate-200 font-semibold">{sample.title}</span>
          <Badge variant="cyan" size="xs">
            {sample.imageType.toUpperCase()} MODE
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowBoxes(!showBoxes)}
            className="flex items-center gap-1.5 text-slate-300 hover:text-cyan-400 transition"
          >
            {showBoxes ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            <span>Bounding Overlays</span>
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative flex-1 min-h-[340px] max-h-[460px] bg-slate-950 flex items-center justify-center overflow-hidden p-2">
        <div className="relative inline-block max-w-full max-h-full rounded-lg overflow-hidden border border-slate-800">
          <img
            src={sample.imageUrl}
            alt={sample.title}
            className="w-full h-auto object-cover max-h-[440px] block select-none"
          />

          {/* Thermal overlay simulation if thermal */}
          {sample.imageType === 'thermal' && (
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-950/40 via-red-950/20 to-yellow-500/20 pointer-events-none mix-blend-color-dodge" />
          )}

          {/* Bounding Boxes */}
          {showBoxes &&
            sample.defects.map((defect) => {
              const isSelected = defect.id === selectedDefectId;
              const isHovered = hoveredDefect?.id === defect.id;

              return (
                <div
                  key={defect.id}
                  onClick={() => onSelectDefect && onSelectDefect(defect)}
                  onMouseEnter={() => setHoveredDefect(defect)}
                  onMouseLeave={() => setHoveredDefect(null)}
                  style={{
                    left: `${defect.box.x}%`,
                    top: `${defect.box.y}%`,
                    width: `${defect.box.width}%`,
                    height: `${defect.box.height}%`,
                  }}
                  className={`absolute border-2 rounded cursor-pointer transition-all duration-150 ${getSeverityBorder(
                    defect.severity
                  )} ${isSelected || isHovered ? 'ring-2 ring-cyan-400 scale-[1.02]' : ''}`}
                >
                  {/* Defect Label Pill */}
                  <div
                    className={`absolute -top-6 left-0 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold whitespace-nowrap shadow-md ${
                      defect.severity === 'critical'
                        ? 'bg-red-600 text-white'
                        : 'bg-amber-600 text-slate-950'
                    }`}
                  >
                    {defect.label} ({defect.confidence.toFixed(1)}%)
                  </div>
                </div>
              );
            })}

          {/* Hover HUD preview */}
          {hoveredDefect && (
            <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-lg bg-slate-950/95 border border-cyan-700/80 shadow-2xl backdrop-blur-md text-xs font-mono z-20">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-cyan-300">{hoveredDefect.label}</span>
                <Badge
                  variant={hoveredDefect.severity === 'critical' ? 'critical' : 'warning'}
                  size="xs"
                >
                  {hoveredDefect.confidence.toFixed(1)}% Certainty
                </Badge>
              </div>
              <div className="text-slate-300 text-[11px]">{hoveredDefect.metric}</div>
              <div className="text-slate-400 text-[10px] mt-0.5">{hoveredDefect.location}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};