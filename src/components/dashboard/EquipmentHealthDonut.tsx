import React from 'react';

export const EquipmentHealthDonut: React.FC = () => {
  const percentage = 86;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="rounded-xl p-4 bg-[#0c162b] border border-[#182747] flex flex-col justify-between h-full">
      <div className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider mb-2">
        Equipment Health
      </div>

      <div className="flex items-center justify-center gap-6 my-auto py-1">
        {/* Donut circle */}
        <div className="relative flex items-center justify-center">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="#152442"
              strokeWidth="7"
              fill="transparent"
            />
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="#10b981"
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-lg font-bold font-mono text-slate-100 leading-none">
              86%
            </span>
            <span className="text-[10px] text-emerald-400 font-mono mt-0.5">
              Healthy
            </span>
          </div>
        </div>

        {/* Legend Breakdown */}
        <div className="space-y-1.5 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-slate-300">Healthy</span>
            <span className="text-slate-100 font-semibold ml-auto">86%</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="text-slate-300">Warning</span>
            <span className="text-slate-100 font-semibold ml-auto">10%</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            <span className="text-slate-300">Critical</span>
            <span className="text-slate-100 font-semibold ml-auto">4%</span>
          </div>
        </div>
      </div>
    </div>
  );
};