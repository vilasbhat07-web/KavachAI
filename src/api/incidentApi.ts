import { Incident } from '../types/incident';

export const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'GT-01-VIB',
    title: 'High Vibration Detected',
    equipmentId: 'GT-01',
    equipmentName: 'Frame 9F Heavy Duty Gas Turbine',
    severity: 'HIGH',
    status: 'Investigating',
    detectedAt: '2026-09-06T07:04:00Z',
    detectedTimeStr: '12:34 PM',
    description: 'Vibration levels exceeded the configured operating threshold on Bearing #4. Root-cause synthesis indicates blade fatigue unbalance.',
    evidence: {
      telemetry: {
        tag: 'TAG-GT01-VIB-BRG4',
        metric: 'Radial Bearing Vibration Velocity',
        value: '7.42 mm/s RMS',
        threshold: '4.50 mm/s (ISO Zone C)',
        deviation: '+64.9% above baseline',
      },
      fftAnalysis: {
        fundamentalFreq: '60.1 Hz (1X Shaft Speed)',
        peakAmp: '5.08 mm/s peak amplitude (68% energy)',
        subHarmonic: '25.8 Hz (0.43X oil whirl trace)',
        diagnosis: 'Dynamic mechanical unbalance with localized synchronous mass offset',
      },
      computerVision: {
        component: 'Compressor Blade — Stage 4',
        defect: 'Fatigue Crack (0.88 mm aperture)',
        confidence: 96.0,
        location: 'Rotor Blade #14 — Leading Edge',
        severity: 'HIGH',
      },
      ragKnowledge: {
        documentName: 'SOP-MNT-GT01-BRG4_Vibration_Exceedance.pdf',
        section: 'Section 3.2: Immediate Ramp-down Schedule',
        relevance: 96.2,
        clauseExcerpt: 'When Bearing #4 vibration exceeds 7.10 mm/s RMS, the shift engineer must immediately commence controlled load shedding to ≤ 120 MW at a ramp rate not exceeding 10 MW/min.',
      },
      aiReasoning: {
        rootCause: 'Compressor blade microcrack propagation causing localized mass distribution variance, inducing synchronous 1X resonance at Bearing #4.',
        chainOfThought: [
          'Step 1: Telemetry Sentinel triggered at 7.42 mm/s RMS exceeding ISO 10816 Zone C limits.',
          'Step 2: Signal FFT analysis isolated 1X 60.1 Hz harmonic matching rotor speed.',
          'Step 3: Vision model detected 0.88 mm microcrack on Stage 4 Blade #14 with 96% confidence.',
          'Step 4: RAG retrieved SOP-MNT-GT01-BRG4 mandating load shed to base idle (120 MW).',
          'Step 5: Safety Interlock confirmed 10 MW/min ramp rate complies with SIL-3 thermal envelope.',
        ],
      },
      safetyValidation: {
        silRating: 'SIL-3',
        status: 'PASSED',
        maxRampRate: '10 MW/min',
        overrideCheck: 'Zero bypasses active; hardware interlocks locked',
      },
    },
    recommendation: {
      summary: 'Perform authorized NDT verification according to the applicable maintenance SOP and initiate controlled load shedding to base idle (120 MW).',
      actions: [
        'Commence controlled MW derating from 280 MW to ≤ 120 MW at ≤ 10 MW/min.',
        'Engage Auxiliary Lube Oil Pump (P-101B) to guarantee 2.85 bar bearing header pressure.',
        'Dispatch NDT technician with eddy-current probe for borescope verification of Stage 4 Blade #14.',
        'If vibration reaches 7.80 mm/s, execute automatic emergency trip sequence TRIP-SEQ-01.',
      ],
    },
    steps: [
      {
        stepNumber: 1,
        title: 'SENSE / TELEMETRY',
        subtitle: 'Abnormal vibration detected',
        status: 'completed',
        iconName: 'Activity',
        detail: 'Sensor TAG-GT01-VIB-BRG4 reported 7.42 mm/s RMS (exceeds ISO 10816 Zone C threshold 4.5 mm/s).',
        findings: ['7.42 mm/s RMS at 3605 RPM', 'Lube oil temperature elevated to 89.4°C (+14.2°C delta)'],
      },
      {
        stepNumber: 2,
        title: 'SIGNAL ANALYSIS',
        subtitle: 'FFT/anomaly analysis completed',
        status: 'completed',
        iconName: 'Cpu',
        detail: 'FFT spectral decomposition identified fundamental 1X shaft harmonic (60.1 Hz) accounting for 68% of energy.',
        findings: ['60.1 Hz 1X synchronous peak at 5.08 mm/s', 'Minor 0.43X oil whirl sub-harmonic at 25.8 Hz'],
      },
      {
        stepNumber: 3,
        title: 'VISION INSPECTION',
        subtitle: 'Equipment inspection completed',
        status: 'completed',
        iconName: 'ScanEye',
        detail: 'Local YOLOv11 model analyzed borescope imagery of Stage 4 compressor rotor.',
        findings: ['Defect: Fatigue Crack (0.88 mm length)', 'Confidence: 96% on Rotor Blade #14 Leading Edge'],
      },
      {
        stepNumber: 4,
        title: 'KNOWLEDGE RETRIEVAL',
        subtitle: 'Relevant SOP retrieved',
        status: 'completed',
        iconName: 'FileText',
        detail: 'Local bge-large vector search retrieved 3 indexed plant SOPs without internet egress.',
        findings: ['Top hit: SOP-MNT-GT01-BRG4 (Cosine similarity 0.962)', 'Section 3.2: Immediate Ramp-down Schedule to ≤ 120 MW'],
      },
      {
        stepNumber: 5,
        title: 'AI REASONING',
        subtitle: 'Evidence correlated',
        status: 'completed',
        iconName: 'Brain',
        detail: 'Multi-source synthesis correlated mechanical mass loss on blade with bearing vibration signature.',
        findings: ['Root cause: Rotor blade microcrack propagation causing dynamic unbalance', 'Secondary risk: Lube oil boundary lubrication degradation'],
      },
      {
        stepNumber: 6,
        title: 'SAFETY VALIDATION',
        subtitle: 'Recommendation checked',
        status: 'completed',
        iconName: 'ShieldCheck',
        detail: 'SIL-3 safety interlock verified that proposed load shed rate avoids thermal gradient shock.',
        findings: ['SIL-3 check PASSED', 'Maximum ramp rate: 10 MW/min enforced by hard boundary'],
      },
      {
        stepNumber: 7,
        title: 'COPILOT RECOMMENDATION',
        subtitle: 'Awaiting Human-In-The-Loop Approval',
        status: 'in_progress',
        iconName: 'UserCheck',
        detail: 'Decision support payload prepared for authorized shift engineer sign-off.',
        findings: ['Recommended Action: Controlled derate to 120 MW + Eddy-current NDT', 'Decision required: [APPROVE] / [REJECT] / [REQUEST MORE EVIDENCE]'],
      },
    ],
  },
  {
    id: 'TR-801-THM',
    title: 'High Voltage Bushing Thermal Hotspot',
    equipmentId: 'TR-801',
    equipmentName: 'Generator Step-Up Transformer 400kV',
    severity: 'MEDIUM',
    status: 'Open',
    detectedAt: '2026-09-06T06:15:00Z',
    detectedTimeStr: '11:45 AM',
    description: 'FLIR infrared thermography identified +62.5°C thermal delta on Phase B terminal clamp.',
    evidence: {
      telemetry: {
        tag: 'TAG-TR801-THM-BUSH',
        metric: 'Phase B Bushing Surface Temp',
        value: '94.6°C',
        threshold: '75.0°C (NETA MTS Class 1)',
        deviation: '+19.6°C above warning limit',
      },
      fftAnalysis: {
        fundamentalFreq: '100 Hz (Harmonic hum)',
        peakAmp: '0.85 mm/s',
        subHarmonic: 'N/A (Static apparatus)',
        diagnosis: 'Acoustic tank vibration normal; purely thermal resistive fault',
      },
      computerVision: {
        component: '400kV Phase B Terminal Flange',
        defect: 'Resistive Connection Hotspot',
        confidence: 98.4,
        location: 'Terminal Clamp Bolted Connection',
        severity: 'MEDIUM',
      },
      ragKnowledge: {
        documentName: 'MANUAL-TR801_Transformer_DGA_Analysis.pdf',
        section: 'Section 4.1: Terminal Torque & Thermography',
        relevance: 93.5,
        clauseExcerpt: 'Connections exhibiting > 40°C temperature rise over ambient indicate severe resistive degradation and require immediate load limitation.',
      },
      aiReasoning: {
        rootCause: 'Galvanic oxidation of terminal bimetallic clamp causing localized contact resistance increase under heavy load.',
        chainOfThought: [
          'Thermal anomaly identified during routine FLIR sweep.',
          'DGA oil analysis shows zero acetylene (C2H2) inside tank, proving fault is external to tank oil.',
          'Recommended de-rating transformer load to 65% until retorquing.',
        ],
      },
      safetyValidation: {
        silRating: 'SIL-3',
        status: 'PASSED',
        maxRampRate: 'N/A',
        overrideCheck: 'External bushing isolation verified',
      },
    },
    recommendation: {
      summary: 'De-rate transformer load by 35% and schedule emergency infrared-guided retorquing.',
      actions: [
        'De-rate generator output to 65% maximum continuous rating.',
        'Schedule hot-stick thermal re-scan in 4 hours.',
        'Prepare switchyard outage window for clamp replacement and contact grease application.',
      ],
    },
    steps: [],
  },
  {
    id: 'P-402-PRS',
    title: 'Barrier Fluid Seal Pressure Drop',
    equipmentId: 'P-402',
    equipmentName: 'High-Pressure Boiler Feed Pump #2',
    severity: 'LOW',
    status: 'Resolved',
    detectedAt: '2026-09-05T14:20:00Z',
    detectedTimeStr: '02:20 PM',
    description: 'API Plan 53A barrier fluid reservoir pressure dropped to 13.8 bar. Re-pressurized with N2.',
    evidence: {
      telemetry: {
        tag: 'TAG-P402-SEAL-PRESS',
        metric: 'Plan 53A Barrier Reservoir',
        value: '13.8 bar (Restored to 16.5 bar)',
        threshold: '12.5 bar Trip',
        deviation: 'Nominal recovered',
      },
      fftAnalysis: {
        fundamentalFreq: '49.8 Hz',
        peakAmp: '2.15 mm/s',
        subHarmonic: 'None',
        diagnosis: 'Normal mechanical vibration',
      },
      computerVision: {
        component: 'Mechanical Seal Cartridge',
        defect: 'Micro-seepage (Mitigated)',
        confidence: 89.5,
        location: 'Gland Plate Throttle Bushing',
        severity: 'LOW',
      },
      ragKnowledge: {
        documentName: 'P&ID-SYS-FEED-402_Boiler_Feed_Hydraulics.dwg',
        section: 'Note 4: API 53A Minimum Pressure',
        relevance: 89.4,
        clauseExcerpt: 'Maintain +1.5 bar differential above stuffing box.',
      },
      aiReasoning: {
        rootCause: 'Normal nitrogen bladder permeation compensated via routine top-up.',
        chainOfThought: ['Pressure dip detected', 'Auto-fill valve activated', 'Normal envelope restored'],
      },
      safetyValidation: {
        silRating: 'SIL-2',
        status: 'PASSED',
        maxRampRate: 'N/A',
        overrideCheck: 'Interlock armed',
      },
    },
    recommendation: {
      summary: 'Nitrogen recharge completed. Reservoir holding at 16.5 bar.',
      actions: ['Log pressure trend for 24 hours.'],
    },
    steps: [],
  },
];

let incidentsStore: Incident[] = [...MOCK_INCIDENTS];

export const incidentApi = {
  async getIncidents(): Promise<Incident[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return [...incidentsStore];
  },

  async getIncidentById(id: string): Promise<Incident | undefined> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    return incidentsStore.find((i) => i.id === id);
  },

  async recordDecision(
    incidentId: string,
    decision: 'APPROVED' | 'REJECTED' | 'MORE_EVIDENCE_REQUESTED',
    notes?: string
  ): Promise<Incident> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const inc = incidentsStore.find((i) => i.id === incidentId);
    if (!inc) throw new Error('Incident not found');

    inc.recommendation.operatorDecision = decision;
    inc.recommendation.decisionTimestamp = new Date().toISOString();
    inc.recommendation.decisionNotes = notes;

    if (decision === 'APPROVED') {
      inc.status = 'Mitigated';
      if (inc.steps.length >= 7) {
        inc.steps[6].status = 'completed';
        inc.steps[6].subtitle = 'Approved by Operator (SIL-3 Mitigated)';
      }
    } else if (decision === 'REJECTED') {
      inc.status = 'Investigating';
    } else {
      inc.status = 'Pending Approval';
    }

    return { ...inc };
  },
};