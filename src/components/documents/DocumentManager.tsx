import React, { useState, useEffect } from 'react';
import { documentApi } from '../../api/documentApi';
import { IngestedDocument, IngestionPipelineStage } from '../../types/document';
import { DocPreviewModal } from './DocPreviewModal';
import { DropZone } from './DropZone';
import {
  FileText,
  Search,
  Upload,
  Database,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  MoreVertical,
  SlidersHorizontal,
  Plus,
  BookOpen,
  FileCheck,
  Cpu,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../common/Modal';

export const DocumentManager: React.FC = () => {
  const { addToast } = useToast();
  const [documents, setDocuments] = useState<IngestedDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDoc, setSelectedDoc] = useState<IngestedDocument | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    try {
      const data = await documentApi.getDocuments();
      setDocuments(data);
    } catch (err) {
      console.error('Failed to load documents', err);
    }
  };

  const categories = [
    { label: 'SOPs', key: 'SOP', count: 5 },
    { label: 'Technical Manuals', key: 'Manual', count: 3 },
    { label: 'Standards', key: 'Standard', count: 2 },
    { label: 'P&ID Drawings', key: 'P&ID', count: 1 },
    { label: 'Maintenance Logs', key: 'Audit', count: 1 },
  ];

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase());
    if (selectedCategory === 'ALL') return matchesSearch;
    if (selectedCategory === 'Standard') {
      return matchesSearch && (doc.category === 'Manual' || doc.name.includes('ISO') || doc.name.includes('Standard'));
    }
    return matchesSearch && doc.category === selectedCategory;
  });

  const pipelineSteps = [
    { label: 'Upload', icon: <Upload className="h-4 w-4" /> },
    { label: 'Extract', icon: <FileText className="h-4 w-4" /> },
    { label: 'Chunk', icon: <Layers className="h-4 w-4" /> },
    { label: 'Embed', icon: <Cpu className="h-4 w-4" /> },
    { label: 'Index', icon: <CheckCircle2 className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-4">
      {/* Top Search & DB Status Bar matching Screen 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0c162b] border border-[#182747] p-3 rounded-xl">
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-semibold">
          <Database className="h-4 w-4" />
          <span>Local Vector DB</span>
          <span className="text-slate-400 font-normal">•</span>
          <span className="text-emerald-400 font-medium">Connected</span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="pl-8 pr-3 py-1.5 rounded-lg bg-[#081021] border border-[#1b2a4a] text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono w-48 sm:w-64"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1853ad] hover:bg-[#1e61c7] text-white text-xs font-semibold tracking-wide shadow-md transition shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Top 4 Stats Cards matching Screen 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-[#0c162b] border border-[#182747]">
          <div className="text-[10px] font-mono uppercase text-slate-400">Total Documents</div>
          <div className="text-xl font-bold font-mono text-slate-100 mt-1">12</div>
        </div>

        <div className="p-3 rounded-xl bg-[#0c162b] border border-[#182747]">
          <div className="text-[10px] font-mono uppercase text-slate-400">Indexed</div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1 flex items-center gap-2">
            <span>12</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#0c162b] border border-[#182747]">
          <div className="text-[10px] font-mono uppercase text-slate-400">Processing</div>
          <div className="text-xl font-bold font-mono text-slate-400 mt-1">0</div>
        </div>

        <div className="p-3 rounded-xl bg-[#0c162b] border border-[#182747]">
          <div className="text-[10px] font-mono uppercase text-slate-400">Last Updated</div>
          <div className="text-xs font-mono text-slate-300 mt-2 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-cyan-400" />
            <span>06 Sep 2026 12:20 PM</span>
          </div>
        </div>
      </div>

      {/* Two Column Section: Categories on Left, Document Table on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Document Categories (3 cols) */}
        <div className="lg:col-span-3 rounded-xl bg-[#0c162b] border border-[#182747] p-3.5 space-y-2">
          <div className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider mb-2">
            Document Categories
          </div>

          <div className="space-y-1">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition ${
                selectedCategory === 'ALL'
                  ? 'bg-[#12284c] text-cyan-300 font-bold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#091122]'
              }`}
            >
              <span>All Documents</span>
              <span className="text-slate-500">12</span>
            </button>

            {categories.map((cat) => (
              <button
                key={cat.label}
                onClick={() => setSelectedCategory(cat.key)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition ${
                  selectedCategory === cat.key
                    ? 'bg-[#12284c] text-cyan-300 font-bold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#091122]'
                }`}
              >
                <span className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-cyan-400" />
                  <span>{cat.label}</span>
                </span>
                <span className="text-slate-500">{cat.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Clean Document Table (9 cols) */}
        <div className="lg:col-span-9 rounded-xl bg-[#0c162b] border border-[#182747] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#081021] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#182747]">
                <tr>
                  <th className="px-4 py-3">Document Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Chunks</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#15233e]">
                {filteredDocs.map((doc) => (
                  <tr
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className="hover:bg-[#0f1d38] cursor-pointer transition"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded bg-blue-950/60 border border-blue-800/60 flex items-center justify-center text-blue-400 shrink-0">
                          <FileText className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-slate-200 truncate max-w-xs sm:max-w-md">
                          {doc.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-slate-400">
                      {doc.category === 'P&ID' ? 'Drawing' : doc.category}
                    </td>

                    <td className="px-4 py-3.5 text-slate-300 font-semibold">
                      {doc.chunksCount}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-[10px]">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Indexed
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDoc(doc);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-[#122240]"
                        title="Inspect RAG Chunks"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom: Ingestion Pipeline Visual Flow matching Screen 2 */}
      <div className="rounded-xl bg-[#0c162b] border border-[#182747] p-4">
        <div className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider mb-4">
          Ingestion Pipeline
        </div>

        <div className="flex items-center justify-between max-w-3xl mx-auto px-4 py-2">
          {pipelineSteps.map((step, idx) => (
            <React.Fragment key={step.label}>
              <div className="flex flex-col items-center gap-1.5">
                <div className="h-10 w-10 rounded-full bg-emerald-950/70 border border-emerald-500/60 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-950/40">
                  {step.icon}
                </div>
                <span className="text-[11px] font-mono text-slate-300 font-medium">
                  {step.label}
                </span>
              </div>

              {idx < pipelineSteps.length - 1 && (
                <div className="flex-1 h-[2px] bg-emerald-900/60 mx-3 relative">
                  <ArrowRight className="h-3 w-3 text-emerald-500 absolute -top-1.5 right-0" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Industrial Documentation"
        maxWidth="lg"
      >
        <DropZone
          onUpload={async (file, classification, plantUnit) => {
            setIsUploading(true);
            try {
              const newDoc = await documentApi.uploadAndIndex(
                file,
                classification,
                plantUnit
              );
              setDocuments((prev) => [newDoc, ...prev]);
              setShowUploadModal(false);
              addToast({
                type: 'success',
                title: 'Document Ingested',
                message: `${file.name} chunked into ${newDoc.chunksCount} vectors.`,
              });
            } finally {
              setIsUploading(false);
            }
          }}
          isUploading={isUploading}
        />
      </Modal>

      {/* Chunk preview modal */}
      <DocPreviewModal
        document={selectedDoc}
        isOpen={Boolean(selectedDoc)}
        onClose={() => setSelectedDoc(null)}
      />
    </div>
  );
};