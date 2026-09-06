import React, { useState, useRef } from 'react';
import { UploadCloud, FileCheck, Shield, AlertCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { IngestedDocument, DocumentClassification } from '../../types/document';
import { useCopilot } from '../../context/CopilotContext';

interface DropZoneProps {
  onUpload: (
    file: { name: string; size: number; type: string },
    classification: DocumentClassification,
    plantUnit: string
  ) => void;
  isUploading: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({ onUpload, isUploading }) => {
  const { activeMachine } = useCopilot();
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [classification, setClassification] = useState<DocumentClassification>('Air-Gap Golden');
  const [plantUnit, setPlantUnit] = useState(activeMachine.name);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (!selectedFile) return;
    onUpload(
      {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
      },
      classification,
      plantUnit
    );
    setSelectedFile(null);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div>
          <div className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <UploadCloud className="h-4 w-4 text-cyan-400" />
            Air-Gapped Document Ingestion Pipeline
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            Ingest technical manuals, P&ID schematics, and SOPs into local offline vector store
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-800 text-[10px] font-mono text-emerald-300">
          <Shield className="h-3 w-3" />
          100% On-Premise Vectorization
        </div>
      </div>

      {/* Drop Target Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
          dragOver
            ? 'border-cyan-400 bg-cyan-950/20'
            : 'border-slate-700/80 hover:border-slate-600 bg-slate-950/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.dwg,.docx,.json,.txt"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-cyan-400 mb-2">
          <UploadCloud className="h-5 w-5" />
        </div>

        {selectedFile ? (
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
            <FileCheck className="h-4 w-4" />
            <span className="font-semibold">{selectedFile.name}</span>
            <span className="text-slate-500">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
          </div>
        ) : (
          <div>
            <div className="text-xs font-semibold text-slate-200">
              Drop industrial documentation here, or <span className="text-cyan-400">browse local drive</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-mono">
              Accepted: PDF, DWG (AutoCAD), DOCX, JSON Schematics (Max 50 MB)
            </div>
          </div>
        )}
      </div>

      {/* Metadata Configuration Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-800/80">
        <div>
          <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
            Data Classification
          </label>
          <select
            value={classification}
            onChange={(e) => setClassification(e.target.value as DocumentClassification)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
          >
            <option value="Air-Gap Golden">Air-Gap Golden (Strict Local)</option>
            <option value="Restricted">Restricted Plant Asset</option>
            <option value="Confidential">Confidential Maintenance</option>
            <option value="Internal">Internal Technical SOP</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
            Equipment Association
          </label>
          <input
            type="text"
            value={plantUnit}
            onChange={(e) => setPlantUnit(e.target.value)}
            placeholder="e.g. Gas Turbine GT-01"
            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <div className="flex items-end">
          <Button
            variant="primary"
            className="w-full"
            disabled={!selectedFile || isUploading}
            loading={isUploading}
            onClick={handleSubmit}
          >
            {isUploading ? 'Vectorizing Local Index...' : 'Ingest & Index'}
          </Button>
        </div>
      </div>
    </div>
  );
};