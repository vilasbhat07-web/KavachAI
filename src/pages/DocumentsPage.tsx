import React from 'react';
import { DocumentManager } from '../components/documents/DocumentManager';

export const DocumentsPage: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <DocumentManager />
    </div>
  );
};