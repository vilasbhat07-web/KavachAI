import React, { useState, useEffect } from 'react';
import { IngestedDocument, VectorChunk } from '../../types/document';
import { documentApi } from '../../api/documentApi';
import { Modal } from '../common/Modal';
import { FileText, Hash, ShieldCheck, Tag, Copy, Check } from 'lucide-react';
import { Badge } from '../common/Badge';

interface DocPreviewModalProps {
  document: IngestedDocument | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DocPreviewModal: React.FC<DocPreviewModalProps> = ({
  document,
  isOpen,
  onClose,
}) => {
  const [chunks, setChunks] = useState<VectorChunk[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (document) {
      documentApi.getDocumentChunks(document.id).then(setChunks);
    }
  }, [document]);

  if (!document) return null;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(document.sha256Hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-cyan-400" />
          <span>{document.name}</span>
        </div>
      }
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Integrity Provenance Seal */}
        <div className="rounded-lg bg-slate-950 border border-slate-800 p-3.5 font-mono text-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-400 uppercase mb-2">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" /> Cryptographic Integrity Seal
            </span>
            <Badge variant="success" size="xs">
              AIR-GAP VERIFIED
            </Badge>
          </div>

          <div className="flex items-center justify-between bg-slate-900/90 px-2.5 py-1.5 rounded border border-slate-800 text-[11px]">
            <span className="text-slate-300 truncate mr-2 font-mono">
              SHA256: {document.sha256Hash}
            </span>
            <button
              onClick={handleCopyHash}
              className="text-slate-400 hover:text-cyan-400 transition shrink-0"
              title="Copy Full Hash"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 text-[10px] text-slate-400">
            <div>Author: <span className="text-slate-200">{document.author}</span></div>
            <div>Classification: <span className="text-cyan-400">{document.classification}</span></div>
          </div>
        </div>

        {/* Chunks breakdown */}
        <div>
          <div className="text-xs font-semibold text-slate-300 mb-2 font-mono uppercase tracking-wider">
            Parsed Embedding Chunks ({chunks.length} extracted)
          </div>

          <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
            {chunks.map((chunk) => (
              <div
                key={chunk.id}
                className="p-3 rounded-lg border border-slate-800 bg-slate-950/80 text-xs font-mono"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
                  <span className="text-cyan-400 font-semibold">Chunk #{chunk.chunkIndex}</span>
                  {chunk.pageNumber && <span>Page {chunk.pageNumber}</span>}
                  {chunk.relevanceScore && (
                    <span className="text-emerald-400">
                      Relevance: {chunk.relevanceScore.toFixed(1)}%
                    </span>
                  )}
                </div>

                <div className="text-slate-300 leading-relaxed bg-slate-900/50 p-2 rounded border border-slate-800/80">
                  {chunk.content}
                </div>

                {chunk.tags && chunk.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <Tag className="h-3 w-3 text-slate-500" />
                    {chunk.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};