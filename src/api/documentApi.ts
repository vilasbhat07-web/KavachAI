import { IngestedDocument, VectorChunk, IngestionPipelineStage } from '../types/document';
import { MOCK_DOCUMENTS, MOCK_CHUNKS } from './mockData';

let documentsStore: IngestedDocument[] = [...MOCK_DOCUMENTS];
let chunksStore: VectorChunk[] = [...MOCK_CHUNKS];

export const documentApi = {
  async getDocuments(): Promise<IngestedDocument[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return [...documentsStore];
  },

  async getDocumentChunks(documentId?: string): Promise<VectorChunk[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (!documentId) return [...chunksStore];
    return chunksStore.filter((c) => c.documentId === documentId);
  },

  async deleteDocument(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 120));
    documentsStore = documentsStore.filter((d) => d.id !== id);
    chunksStore = chunksStore.filter((c) => c.documentId !== id);
  },

  async uploadAndIndex(
    file: { name: string; size: number; type: string },
    classification: IngestedDocument['classification'],
    plantUnit: string,
    onProgress?: (stages: IngestionPipelineStage[]) => void
  ): Promise<IngestedDocument> {
    const stages: IngestionPipelineStage[] = [
      { id: '1', name: '1. Local OCR & Raster Extraction', description: 'Extracting clean text & vector diagrams on-premise without cloud transmission', status: 'running', progress: 25 },
      { id: '2', name: '2. Semantic Structural Chunking', description: 'Splitting document by SOP hierarchy, P&ID tags, and safety clauses', status: 'idle', progress: 0 },
      { id: '3', name: '3. On-Premise Vector Embedding', description: 'Computing 1024-dim dense vectors using local bge-large-en-v1.5 model', status: 'idle', progress: 0 },
      { id: '4', name: '4. Air-Gapped HNSW Vector Indexing', description: 'Inserting vectors into local isolated index with SHA-256 integrity seal', status: 'idle', progress: 0 },
    ];

    if (onProgress) onProgress([...stages]);
    await new Promise((r) => setTimeout(r, 500));

    stages[0].status = 'completed';
    stages[0].progress = 100;
    stages[1].status = 'running';
    stages[1].progress = 50;
    if (onProgress) onProgress([...stages]);
    await new Promise((r) => setTimeout(r, 600));

    stages[1].status = 'completed';
    stages[1].progress = 100;
    stages[2].status = 'running';
    stages[2].progress = 75;
    if (onProgress) onProgress([...stages]);
    await new Promise((r) => setTimeout(r, 600));

    stages[2].status = 'completed';
    stages[2].progress = 100;
    stages[3].status = 'running';
    stages[3].progress = 90;
    if (onProgress) onProgress([...stages]);
    await new Promise((r) => setTimeout(r, 500));

    stages[3].status = 'completed';
    stages[3].progress = 100;
    if (onProgress) onProgress([...stages]);

    const fakeHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const newDoc: IngestedDocument = {
      id: 'doc-' + Date.now(),
      name: file.name,
      category: file.name.toUpperCase().includes('SOP') ? 'SOP' : file.name.endsWith('.dwg') ? 'P&ID' : 'Manual',
      fileType: file.name.endsWith('.dwg') ? 'dwg' : file.name.endsWith('.docx') ? 'docx' : 'pdf',
      sizeBytes: file.size,
      uploadDate: new Date().toISOString(),
      status: 'indexed',
      chunksCount: Math.floor(file.size / 30000) + 12,
      classification,
      sha256Hash: fakeHash,
      plantUnit: plantUnit || 'General Facility',
      author: 'Authenticated Plant Engineer',
      version: 'Rev 1.0-AirGap',
      summary: `Air-gapped indexed technical document containing operational guidelines and telemetry standards for ${plantUnit}.`,
    };

    documentsStore.unshift(newDoc);

    chunksStore.unshift({
      id: 'chunk-' + Date.now(),
      documentId: newDoc.id,
      docName: newDoc.name,
      chunkIndex: 1,
      pageNumber: 1,
      content: `[EXTRACTED CHUNK 01 - ${newDoc.name}]: Ingested into KAVACHA air-gapped vector enclave. Validated against IEC 62443 compliance boundary. Reference equipment tag: ${plantUnit}.`,
      relevanceScore: 92.4,
      tags: ['Uploaded', plantUnit, 'Air-Gap Enclave'],
      sha256: fakeHash,
    });

    return newDoc;
  },
};