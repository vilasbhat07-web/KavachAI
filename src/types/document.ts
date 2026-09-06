export type DocumentClassification = 'Air-Gap Golden' | 'Restricted' | 'Confidential' | 'Internal';

export interface IngestedDocument {
  id: string;
  name: string;
  category: 'SOP' | 'P&ID' | 'Manual' | 'Audit' | 'Telemetry';
  fileType: 'pdf' | 'dwg' | 'docx' | 'json';
  sizeBytes: number;
  uploadDate: string;
  status: 'indexed' | 'indexing' | 'failed';
  chunksCount: number;
  classification: DocumentClassification;
  sha256Hash: string;
  plantUnit: string;
  author: string;
  version: string;
  summary: string;
}

export interface VectorChunk {
  id: string;
  documentId: string;
  docName: string;
  chunkIndex: number;
  pageNumber?: number;
  content: string;
  relevanceScore: number;
  tags: string[];
  pAndIdRef?: string;
  sha256: string;
}

export interface IngestionPipelineStage {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress: number;
  latencyMs?: number;
}
