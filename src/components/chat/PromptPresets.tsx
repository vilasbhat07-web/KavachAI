import React from 'react';
import { PromptPreset } from '../../types/chat';
import { Sparkles, Activity, Flame, ShieldAlert, Cpu } from 'lucide-react';
import { Badge } from '../common/Badge';

interface PromptPresetsProps {
  presets: PromptPreset[];
  onSelect: (preset: PromptPreset) => void;
}

export const PromptPresets: React.FC<PromptPresetsProps> = ({ presets, onSelect }) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'vibration':
        return <Activity className="h-3.5 w-3.5 text-amber-400" />;
      case 'thermal':
        return <Flame className="h-3.5 w-3.5 text-red-400" />;
      case 'sop':
        return <ShieldAlert className="h-3.5 w-3.5 text-cyan-400" />;
      default:
        return <Cpu className="h-3.5 w-3.5 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 uppercase tracking-wider">
        <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
        <span>Industrial Diagnostic Quick Presets</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onSelect(preset)}
            className="flex flex-col text-left p-2.5 rounded-lg border border-slate-800/90 bg-slate-900/60 hover:bg-slate-850 hover:border-cyan-700/60 transition-all duration-150 group shadow-sm"
          >
            <div className="flex items-center justify-between w-full mb-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                {getCategoryIcon(preset.category)}
                <span>{preset.title}</span>
              </div>
              <Badge variant="cyan" size="xs">
                {preset.badge}
              </Badge>
            </div>
            <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
              {preset.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};