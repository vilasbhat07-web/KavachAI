import React from 'react';
import { useCopilot } from '../../context/CopilotContext';
import { CitationCard } from './CitationCard';
import { SchematicViewer } from './SchematicViewer';
import { HashProvenance } from './HashProvenance';
import { FileSearch, ShieldCheck, X } from 'lucide-react';
import { MOCK_INITIAL_MESSAGES } from '../../api/mockData';

interface EvidenceSourcePanelProps {
  onClose?: () => void;
}

export const EvidenceSourcePanel: React.FC<EvidenceSourcePanelProps> = ({ onClose }) => {
  const { activeCitation } = useCopilot();
  const defaultCitation = MOCK_INITIAL_MESSAGES[2]?.citations?.[0];
  const citationToDisplay = activeCitation || defaultCitation;

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/90 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-200 font-semibold uppercase">
          <FileSearch className="h-4 w-4 text-cyan-400" />
          <span>Evidence & Grounding Inspector</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {citationToDisplay ? (
          <>
            <div>
              <div className="text-xs font-mono uppercase text-slate-400 mb-2">
                Active Grounding Excerpt
              </div>
              <CitationCard citation={citationToDisplay} />
            </div>

            <SchematicViewer activeTag={citationToDisplay.pAndIdTag} />

            <HashProvenance
              sha256={citationToDisplay.sha256}
              sourceDoc={citationToDisplay.documentName}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-xs font-mono text-center p-4">
            <FileSearch className="h-8 w-8 text-slate-600 mb-2" />
            <span>Select any citation chip in the Copilot workbench to inspect its grounding proof.</span>
          </div>
        )}
      </div>
    </div>
  );
};