import React from 'react';
import { EquipmentVision } from '../components/vision/EquipmentVision';

export const VisionPage: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <EquipmentVision />
    </div>
  );
};