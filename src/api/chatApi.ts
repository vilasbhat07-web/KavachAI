import { Message, PromptPreset } from '../types/chat';
import { MOCK_INITIAL_MESSAGES, MOCK_PROMPT_PRESETS } from './mockData';

let messagesStore: Message[] = [...MOCK_INITIAL_MESSAGES];

export const chatApi = {
  async getHistory(): Promise<Message[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return [...messagesStore];
  },

  async getPresets(): Promise<PromptPreset[]> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    return [...MOCK_PROMPT_PRESETS];
  },

  async clearHistory(): Promise<void> {
    messagesStore = [MOCK_INITIAL_MESSAGES[0]];
  },

  async sendMessage(
    userContent: string,
    machineId: string,
    onStreamChunk?: (partial: string) => void
  ): Promise<Message> {
    const userMsg: Message = {
      id: 'msg-user-' + Date.now(),
      role: 'user',
      content: userContent,
      timestamp: new Date().toISOString(),
      machineId,
    };
    messagesStore.push(userMsg);

    await new Promise((resolve) => setTimeout(resolve, 350));

    const lower = userContent.toLowerCase();
    let responseText = '';
    const citations = [...(MOCK_INITIAL_MESSAGES[2]?.citations || [])];
    let alertLevel: 'nominal' | 'advisory' | 'warning' | 'critical' = 'nominal';
    let confidence = 94.2;

    if (lower.includes('vibration') || lower.includes('gt-01') || lower.includes('bearing')) {
      alertLevel = 'critical';
      confidence = 96.4;
      responseText = `### 🚨 Urgent Diagnostic Finding: GT-01 Bearing #4 Vibration Exceedance

Based on real-time SCADA telemetry and cross-referenced plant SOPs, **GT-01 Bearing #4 vibration at 7.42 mm/s RMS is in critical ISO 10816-3 Zone D ("Unrestricted operation may cause catastrophic structural damage")**.

---

#### 1. Telemetry & FFT Spectrum Analysis
- **Overall Vibration Level**: **7.42 mm/s RMS** (Threshold Zone C: 4.5 mm/s, Zone D Trip: 7.10 mm/s)
- **Dominant Frequency Peak**: **1X Shaft Speed (60.1 Hz)** accounting for 68% of spectral energy, with synchronous phase shift of +44°.
- **Sub-harmonic Peak**: Moderate 0.43X oil whirl sub-synchronous component detected at 25.8 Hz.
- **Lube Oil Telemetry**: Bearing #4 return temperature is **89.4°C** (+14.2°C elevated over 30-day moving average).

---

#### 2. Immediate Recommended SOP Actions (SOP-MNT-GT01-BRG4)
1. **Reduce MW Load Immediately**: Throttle output from 280 MW to base idle (120 MW) at a controlled ramp rate of ≤ 10 MW/min to avoid thermal shock.
2. **Engage Auxiliary Lube Oil Pump (P-101B)**: Ensure pressure remains at **2.85 bar** to prevent boundary lubrication failure.
3. **Trigger Borescope & Visual Inspection**: Inspect Stage 4 compressor blades and journal pads for mechanical rubbing and fatigue spalling.
4. **Prepare Safety Interlock Trip**: If vibration persists > 7.50 mm/s for > 45 seconds, allow automatic SIL-3 protective shutdown.`;
    } else if (lower.includes('loto') || lower.includes('lockout') || lower.includes('p-402')) {
      alertLevel = 'warning';
      confidence = 97.8;
      responseText = `### 🛡️ Air-Gapped LOTO Isolation Plan: P-402 Feed Pump

Lockout/Tagout protocol generated in compliance with **OSHA 1910.147** and plant standard **SOP-SAF-LOTO-1910**:

1. **Zero-Energy Isolation Steps**:
   - **Electrical**: Open 6.6kV vacuum circuit breaker **VCB-P402** in Switchgear Room B; apply Master Padlock #LOTO-402E.
   - **Suction Boundary**: Close and chain motorized gate valve **MOV-402-SUC** (Tag #LOTO-402V1).
   - **Discharge Boundary**: Close high-pressure non-return discharge valve **MOV-402-DIS** (Tag #LOTO-402V2).
   - **Barrier Fluid Loop**: Depressurize API Plan 53A reservoir **RES-402** via manual bleed valve **HV-402B**.

2. **Verification & Sign-off**:
   - Confirm zero pressure on gauge **PG-402-1** (0.00 bar).
   - Verify motor de-energization via calibrated multimeter test at motor terminal box.
   - Dual-operator sign-off required before physical disassembly.`;
    } else if (lower.includes('thermal') || lower.includes('bushing') || lower.includes('tr-801')) {
      alertLevel = 'warning';
      confidence = 95.1;
      responseText = `### 🌡️ Thermal Anomaly Diagnosis: TR-801 Transformer

FLIR thermography analysis confirms localized temperature excursion on **400kV Phase B Bushing Terminal**:

- **Measured Surface Temperature**: **94.6°C** (Delta-T over ambient: **+62.5°C**).
- **NETA MTS Severity**: **Class 1 High Priority Anomaly**. Imminent risk of thermal runaway and gasket degradation.
- **Root Cause Hypothesis**: Loose bolted terminal clamp or contact resistance degradation due to galvanic oxidation.
- **Recommended Action**: De-rate transformer load by 35% immediately. Schedule emergency infrared-guided retorquing during next scheduled low-demand window.`;
    } else {
      confidence = 92.5;
      responseText = `### 📋 Air-Gapped Operational Assessment: ${machineId}

Query processed by KAVACHA on-premise inference cluster.
- **SCADA Status**: Normal operating envelope.
- **Knowledge Base Retrieval**: Evaluated 18 relevant SOP sections with zero internet connectivity.
- **Cryptographic Provenance**: Model inference hash verified against offline golden image.

Please select an industrial query preset or provide specific telemetry tags (e.g. pressure, temperature, vibration) for deep-dive root-cause synthesis.`;
    }

    if (onStreamChunk) {
      const words = responseText.split(' ');
      let accumulated = '';
      for (let i = 0; i < words.length; i++) {
        accumulated += (i === 0 ? '' : ' ') + words[i];
        onStreamChunk(accumulated);
        await new Promise((r) => setTimeout(r, 12));
      }
    }

    const aiMsg: Message = {
      id: 'msg-ai-' + Date.now(),
      role: 'assistant',
      content: responseText,
      timestamp: new Date().toISOString(),
      machineId,
      confidenceScore: confidence,
      safetyAlertLevel: alertLevel,
      reasoningSteps: [
        {
          id: 'step-' + Date.now() + '-1',
          title: 'Air-Gapped Telemetry & Parameter Ingestion',
          description: `Retrieved live metrics for ${machineId} via local Modbus/OPC-UA buffer.`,
          status: 'completed',
          durationMs: 45,
          timestamp: new Date().toLocaleTimeString(),
        },
        {
          id: 'step-' + Date.now() + '-2',
          title: 'Semantic SOP & Schematic Cross-Referencing',
          description: 'Queried on-premise local vector store. Extracted verified technical clauses.',
          status: 'completed',
          durationMs: 78,
          timestamp: new Date().toLocaleTimeString(),
        },
        {
          id: 'step-' + Date.now() + '-3',
          title: 'SIL Compliance & Safety Boundary Verification',
          description: 'Confirmed recommendation meets fail-safe constraints and air-gap privacy mandates.',
          status: 'completed',
          durationMs: 25,
          timestamp: new Date().toLocaleTimeString(),
        },
      ],
      toolCalls: [
        {
          id: 'tool-' + Date.now(),
          toolName: 'sop_vector_search',
          displayName: 'Local Vector Store Search',
          status: 'success',
          executionTimeMs: 68,
          input: { query: userContent.slice(0, 60), machineId },
          output: { matchCount: 3, topScore: confidence / 100 },
        },
      ],
      citations,
    };

    messagesStore.push(aiMsg);
    return aiMsg;
  },
};