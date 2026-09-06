<<<<<<< HEAD
﻿# KAVACHA - Private, Air-Gapped Industrial AI Copilot

KAVACHA is a mission-critical, private, air-gapped Industrial AI Copilot frontend dashboard designed for heavy industry, energy, and process manufacturing (turbomachinery, boilers, transformers, heat exchangers).

## Tech Stack
- **React 18** (Functional components, custom contexts, modular hooks)
- **Vite** (Ultra-fast build & HMR)
- **Tailwind CSS** (Industrial dark/light theme, high-visibility safety color accents)
- **React Router v6** (Multi-route operations center)
- **Axios** (Air-gapped isolated API client layer)
- **Lucide React** (High-density industrial icons)

---

## 8 Core Operational Sections

1. **Sidebar**:
   - Navigation across AI Workbench, Document Ingestion, Equipment Vision, Agent Telemetry, and Security & Compliance.
   - Facility context selector (*Turbine Plant 04 - Pune Heavy*).
   - Real-time air-gap footprint (physical disconnect indicator, 0 egress packets, VRAM utilization).
   - Responsive collapsible state for desktop and mobile.

2. **AI Chat / Workbench**:
   - Multi-turn conversation interface with streaming text simulation.
   - Step-by-step reasoning chain (*Air-Gapped Chain-of-Thought*).
   - SCADA & telemetry tool invocation badges (`scada_telemetry_query`, `vibration_fft_spectrum`, `sop_vector_search`).
   - Clickable industrial prompt presets (Turbine vibration surge, Bushing hotspot, Feed pump LOTO).
   - SOP citation chips that link directly to the Evidence Inspector.

3. **Document Ingestion**:
   - Drag-and-drop ingestion dropzone for `.pdf`, `.dwg`, `.docx`, and `.json`.
   - Security classification tagger (*Air-Gap Golden*, *Restricted*, *Confidential*).
   - Animated 4-stage pipeline visualization: *Local OCR -> Semantic Chunking -> On-Prem Embedding -> Isolated HNSW Indexing*.
   - Ingested documents table with chunk counts, SHA-256 seal, and vector chunk preview modal.

4. **Equipment Image Upload & Vision Inspection**:
   - Interactive canvas image viewer with defect bounding box overlays and hover HUD.
   - Mechanical crack segmentation, thermal gradient hotspot analysis, and hydrocarbon seepage.
   - Severity indicators (Critical, Warning, Nominal) with millimeter measurements and ASME/ASTM standards.
   - One-click sample scenario switcher (Turbine blade microcrack, Transformer thermal hotspot, Pump seal leakage).

5. **Agent Telemetry & Activity**:
   - 4 autonomous industrial agents: *Telemetry Sentinel*, *Diagnostic Reasoner*, *Safety Interlock (SIL-3)*, and *Vision YOLO Defect Agent*.
   - Multi-agent cooperative DAG execution flow.
   - Monospace streaming terminal with real-time log levels (`TELEMETRY`, `WARN`, `SECURITY`, `INFO`).

6. **Evidence / Source Panel**:
   - Retrieved technical SOP excerpts with cosine similarity match scores.
   - Interactive P&ID schematic diagram (SVG) with clickable sensor tags.
   - Tamper-proof cryptographic SHA-256 provenance seals.

7. **Security Status & Compliance**:
   - Zero-exfiltration air-gap monitor (48,920 blocked egress packets, 100% packet drops).
   - On-premise runtime telemetry (vLLM on Dual NVIDIA RTX A6000 Ada, 96 GB VRAM).
   - Interactive live integrity audit trigger.
   - Compliance certification checklist (IEC 62443, ISO 27001, NERC CIP, NIST SP 800-82).

8. **Calibrated Confidence Indicator**:
   - Multi-metric circular gauge with safety threshold lines (>= 90% autonomous eligible).
   - Breakdown of retrieval match, SCADA harmonic alignment, vision anomaly certainty, and hallucination risk (< 1%).

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173/` in your browser.

### 3. Build for Production
```bash
npm run build
```
Creates an optimized, type-checked production bundle in `dist/`.

---

## Directory Structure
```
kavacha/
├── src/
│   ├── api/          # Axios client, mock datasets, and API services
│   ├── types/        # TypeScript interfaces for chat, docs, vision, agents, security
│   ├── context/      # ThemeContext, CopilotContext, ToastContext
│   ├── components/
│   │   ├── common/   # Badge, Button, Card, ConfidenceGauge, SecurityStatusBadge, Tabs, Modal, Toast
│   │   ├── layout/   # Sidebar, Header, MainLayout
│   │   ├── chat/     # ChatWorkbench, MessageItem, ReasoningChain, ToolExecutionCard, PromptPresets
│   │   ├── documents/# DocumentManager, DropZone, IngestionPipeline, DocumentList, DocPreviewModal
│   │   ├── vision/   # EquipmentVision, ImageCanvasViewer, DefectTagList, SampleSelector
│   │   ├── agents/   # AgentActivity, AgentCard, PipelineFlow, LiveLogTerminal
│   │   ├── evidence/ # EvidenceSourcePanel, CitationCard, SchematicViewer, HashProvenance
│   │   └── security/ # SecurityDashboard, AirGapAuditCard, ComplianceCert
│   ├── pages/        # DashboardPage, DocumentsPage, VisionPage, AgentsPage, SecurityPage
│   ├── utils/        # Formatters and helpers
│   ├── App.tsx       # Application routes and context wrapping
│   ├── main.tsx      # React root entry
│   └── index.css     # Tailwind directives and industrial animations
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```
=======
"# KavachAI" 
>>>>>>> ba4bb58871996cc6ee465ae25971ea61f4d3acd5
