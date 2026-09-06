import React from 'react';
import { MessageCitation } from '../../types/chat';
import { FileSearch, Hash, ShieldCheck, Tag } from 'lucide-react';
import { Badge } from '../common/Badge';

interface CitationCardProps {
  citation: MessageCitation;
}

export const CitationCard: React.FC<CitationCardProps> = ({ citation }) => {
  return (
    <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/80 font-mono text-xs space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
          <FileSearch className="h-4 w-4 text-cyan-400" />
          <span className="truncate max-w-[220px]">{citation.documentName}</span>
        </div>
        <Badge variant="success" size="xs">
          {citation.relevanceScore.toFixed(1)}% Match
        </Badge>
      </div>

      <div className="text-[11px] text-slate-400 flex items-center gap-2">
        <span>{citation.section}</span>
        {citation.page && <span>(Page {citation.page})</span>}
      </div>

      <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-200 text-xs leading-relaxed font-sans">
        "{citation.snippet}"
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
        {citation.pAndIdTag && (
          <span className="text-cyan-400 flex items-center gap-1">
            <Tag className="h-3 w-3" /> {citation.pAndIdTag}
          </span>
        )}
        <span className="text-slate-400 flex items-center gap-1 font-mono">
          <Hash className="h-3 w-3 text-emerald-400" /> {citation.sha256.slice(0, 10)}...
        </span>
      </div>
    </div>
  );
};