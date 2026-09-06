import React, { useState } from 'react';
import { IngestedDocument } from '../../types/document';
import { formatBytes, truncateHash } from '../../utils/formatters';
import { FileText, Trash2, Eye, Shield, Hash, Layers } from 'lucide-react';
import { Badge } from '../common/Badge';

interface DocumentListProps {
  documents: IngestedDocument[];
  onPreview: (doc: IngestedDocument) => void;
  onDelete: (id: string) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onPreview,
  onDelete,
}) => {
  const [filter, setFilter] = useState<string>('ALL');

  const filteredDocs = documents.filter((doc) => {
    if (filter === 'ALL') return true;
    return doc.category === filter;
  });

  const getClassificationBadge = (classification: IngestedDocument['classification']) => {
    switch (classification) {
      case 'Air-Gap Golden':
        return <Badge variant="success" size="xs">Air-Gap Golden</Badge>;
      case 'Restricted':
        return <Badge variant="warning" size="xs">Restricted</Badge>;
      case 'Confidential':
        return <Badge variant="cyan" size="xs">Confidential</Badge>;
      default:
        return <Badge variant="neutral" size="xs">Internal</Badge>;
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-sm">
      {/* Filter Tabs */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-200 uppercase font-mono">
            Indexed Technical Knowledge Base ({filteredDocs.length} assets)
          </span>
        </div>

        <div className="flex gap-1">
          {['ALL', 'SOP', 'P&ID', 'Manual'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-2.5 py-1 text-xs font-mono rounded transition ${
                filter === cat
                  ? 'bg-slate-800 text-cyan-400 font-semibold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="px-4 py-2.5">Document Name</th>
              <th className="px-4 py-2.5">Classification</th>
              <th className="px-4 py-2.5">Target Machine</th>
              <th className="px-4 py-2.5">Chunks</th>
              <th className="px-4 py-2.5">SHA-256 Seal</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filteredDocs.map((doc) => (
              <tr key={doc.id} className="hover:bg-slate-800/40 transition">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-cyan-400 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-200">{doc.name}</div>
                      <div className="text-[10px] text-slate-500">
                        {formatBytes(doc.sizeBytes)} • {doc.version}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3">
                  {getClassificationBadge(doc.classification)}
                </td>

                <td className="px-4 py-3 text-slate-300">
                  {doc.plantUnit}
                </td>

                <td className="px-4 py-3">
                  <span className="text-cyan-400 font-semibold">{doc.chunksCount}</span>
                  <span className="text-slate-500 text-[10px]"> vectors</span>
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800 max-w-fit">
                    <Hash className="h-3 w-3 text-emerald-400" />
                    <span>{truncateHash(doc.sha256Hash, 6)}</span>
                  </div>
                </td>

                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => onPreview(doc)}
                      className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition"
                      title="Inspect Parsed Vector Chunks"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(doc.id)}
                      className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-red-400 transition"
                      title="Purge from Air-Gap Enclave"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};