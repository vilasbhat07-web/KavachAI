import React from 'react';
import { Gauge, Thermometer, Activity, Zap } from 'lucide-react';

interface TelemetryCardProps {
  label: string;
  value: string;
  unit?: string;
  status: 'Normal' | 'Warning' | 'High' | 'Critical';
  iconType: 'rpm' | 'temperature' | 'vibration' | 'pressure';
}

export const TelemetryCard: React.FC<TelemetryCardProps> = ({
  label,
  value,
  status,
  iconType,
}) => {
  const getIcon = () => {
    switch (iconType) {
      case 'rpm':
        return <Gauge className="h-4 w-4 text-cyan-400" />;
      case 'temperature':
        return <Thermometer className="h-4 w-4 text-blue-400" />;
      case 'vibration':
        return <Activity className="h-4 w-4 text-red-400" />;
      case 'pressure':
        return <Zap className="h-4 w-4 text-emerald-400" />;
    }
  };

  const isAlert = status === 'High' || status === 'Critical';

  return (
    <div
      className={`rounded-xl p-4 border transition-all duration-150 ${
        isAlert
          ? 'bg-[#141224] border-red-900/60 shadow-lg shadow-red-950/30'
          : 'bg-[#0c162b] border-[#182747] hover:border-[#223963]'
      }`}
    >
      <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
        <span className="flex items-center gap-2">
          {getIcon()}
          <span>{label}</span>
        </span>
      </div>

      <div className="flex items-baseline justify-between mt-1">
        <div className="text-2xl font-bold font-mono text-slate-100 tracking-tight">
          {value}
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono font-medium">
          {isAlert ? (
            <span className="flex items-center gap-1.5 text-red-400">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
              ● High
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              ● Normal
            </span>
          )}
        </div>
      </div>
    </div>
  );
};