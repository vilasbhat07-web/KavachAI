import React, { useState } from 'react';
import { Layers, ZoomIn, ZoomOut, Maximize2, Tag } from 'lucide-react';

interface SchematicViewerProps {
  activeTag?: string;
}

export const SchematicViewer: React.FC<SchematicViewerProps> = ({ activeTag = 'TAG-GT01-VIB-BRG4' }) => {
  const [hoveredTag, setHoveredTag] = useState<string | null>(null);

  const tags = [
    { id: 'TAG-GT01-VIB-BRG4', label: 'Bearing #4 Sensor (Zone D Alert)', x: 42, y: 38, critical: true },
    { id: 'TE-404B', label: 'Lube Oil Return TE-404B (89.4°C)', x: 65, y: 52, critical: true },
    { id: 'MOV-101A', label: 'Inlet Fuel Gas MOV-101A (Open)', x: 22, y: 48, critical: false },
    { id: 'PT-302', label: 'Compressor Discharge PT-302 (18.4 bar)', x: 50, y: 24, critical: false },
  ];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2 text-slate-200 font-semibold uppercase">
          <Layers className="h-4 w-4 text-cyan-400" />
          <span>Interactive P&ID Schematic Overlay</span>
        </div>
        <span className="text-[10px] text-cyan-400">DWG Raster v2</span>
      </div>

      {/* Schematic SVG Vector Canvas */}
      <div className="relative w-full h-56 bg-slate-900/90 rounded-lg border border-slate-800/90 overflow-hidden flex items-center justify-center p-3 select-none">
        {/* Schematic Grid Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#475569" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* Main piping lines */}
          <path d="M 40 100 H 420" stroke="#06b6d4" strokeWidth="2.5" fill="none" />
          <path d="M 200 40 V 180" stroke="#f59e0b" strokeWidth="2" fill="none" />
          <path d="M 300 100 V 160 H 380" stroke="#10b981" strokeWidth="1.5" fill="none" />
          {/* Turbine symbolic representation */}
          <circle cx="200" cy="100" r="32" stroke="#cbd5e1" strokeWidth="2" fill="#0f172a" />
          <rect x="240" y="85" width="50" height="30" stroke="#94a3b8" strokeWidth="1.5" fill="#1e293b" />
        </svg>

        {/* Hotspot Sensor Markers */}
        {tags.map((tag) => {
          const isTarget = tag.id === activeTag;
          return (
            <div
              key={tag.id}
              style={{ left: `${tag.x}%`, top: `${tag.y}%` }}
              onMouseEnter={() => setHoveredTag(tag.label)}
              onMouseLeave={() => setHoveredTag(null)}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            >
              <span className="relative flex h-3 w-3">
                {tag.critical && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-3 w-3 border ${
                    tag.critical
                      ? 'bg-red-500 border-red-300'
                      : 'bg-cyan-500 border-cyan-300'
                  } ${isTarget ? 'ring-2 ring-white scale-125' : ''}`}
                />
              </span>

              {/* Tag Tooltip */}
              <div className="absolute left-4 -top-2 hidden group-hover:block z-30 px-2 py-1 rounded bg-slate-950 border border-slate-700 text-[10px] text-slate-200 whitespace-nowrap shadow-xl">
                {tag.label}
              </div>
            </div>
          );
        })}

        {/* Active Hover Banner */}
        {hoveredTag && (
          <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded bg-slate-950/90 border border-cyan-700 text-[10px] text-cyan-300 truncate">
            Inspecting Sensor Tag: {hoveredTag}
          </div>
        )}
      </div>

      <div className="text-[10px] text-slate-500 flex items-center justify-between">
        <span>Schematic Ref: P&ID-SYS-TURB-01-REV4</span>
        <span className="text-cyan-400">4 Active Instrument Loops</span>
      </div>
    </div>
  );
};