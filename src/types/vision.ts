export interface DefectBoundingBox {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage 0-100
  height: number; // percentage 0-100
}

export interface DefectDetection {
  id: string;
  label: string;
  severity: 'critical' | 'warning' | 'nominal';
  confidence: number; // 0-100
  box: DefectBoundingBox;
  location: string;
  metric: string;
  deltaT?: string;
  recommendation: string;
  standardsRef: string;
  sopId: string;
}

export interface EquipmentImageSample {
  id: string;
  title: string;
  machineId: string;
  component: string;
  timestamp: string;
  imageUrl: string;
  imageType: 'visible' | 'thermal' | 'ultrasonic';
  defects: DefectDetection[];
  ambientTempC: number;
  vibrationMmS: number;
  speedRpm: number;
  operatingHours: number;
}
