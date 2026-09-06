import React from 'react';
import { SecurityDashboard } from '../components/security/SecurityDashboard';

export const SecurityPage: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <SecurityDashboard />
    </div>
  );
};