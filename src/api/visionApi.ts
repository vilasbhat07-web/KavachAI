import { EquipmentImageSample, DefectDetection } from '../types/vision';
import { MOCK_VISION_SAMPLES } from './mockData';

let visionSamplesStore: EquipmentImageSample[] = [...MOCK_VISION_SAMPLES];

export const visionApi = {
  async getSamples(): Promise<EquipmentImageSample[]> {
    await new Promise((resolve) => setTimeout(resolve, 120));
    return [...visionSamplesStore];
  },

  async analyzeImage(
    file: { name: string; previewUrl: string },
    machineId: string
  ): Promise<EquipmentImageSample> {
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const detectedDefects: DefectDetection[] = [
      {
        id: 'defect-' + Date.now() + '-1',
        label: 'Localized Fatigue Microcrack',
        severity: 'critical',
        confidence: 94.8,
        box: { x: 34, y: 28, width: 32, height: 42 },
        location: `${machineId} Primary Component Shell`,
        metric: 'Crack Aperture: ~0.74 mm (Stress Concentration Zone)',
        recommendation: 'Perform immediate dye penetrant inspection (PT) and ultrasound shear wave verification.',
        standardsRef: 'ASME Section VIII Div 1 Appendix 4 / ISO 9712',
        sopId: 'doc-sop-gt01-brg4',
      },
      {
        id: 'defect-' + Date.now() + '-2',
        label: 'Surface Oxidation & Pitting',
        severity: 'warning',
        confidence: 88.6,
        box: { x: 68, y: 60, width: 22, height: 26 },
        location: `${machineId} Flange Perimeter`,
        metric: 'Pit Density: Grade 3 Moderate Pitting',
        recommendation: 'Clean with ultrasonic de-greaser and apply high-temperature protective ceramic sealant.',
        standardsRef: 'ASTM G46 / NACE SP0198',
        sopId: 'doc-iso-10816',
      },
    ];

    const newSample: EquipmentImageSample = {
      id: 'vision-uploaded-' + Date.now(),
      title: `Inspection: ${file.name}`,
      machineId,
      component: 'Inspected Structural Element',
      timestamp: new Date().toISOString(),
      imageUrl: file.previewUrl,
      imageType: file.name.toLowerCase().includes('thermal') || file.name.toLowerCase().includes('flir') ? 'thermal' : 'visible',
      ambientTempC: 34.2,
      vibrationMmS: 4.1,
      speedRpm: 3200,
      operatingHours: 12400,
      defects: detectedDefects,
    };

    visionSamplesStore.unshift(newSample);
    return newSample;
  },
};