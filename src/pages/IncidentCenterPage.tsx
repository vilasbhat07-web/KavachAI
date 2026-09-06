import React from 'react';
import { useParams } from 'react-router-dom';
import { IncidentList } from '../components/incidents/IncidentList';
import { IncidentInvestigation } from '../components/incidents/IncidentInvestigation';

export const IncidentCenterPage: React.FC = () => {
  const { incidentId } = useParams<{ incidentId: string }>();

  if (incidentId) {
    return <IncidentInvestigation />;
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1600px] mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wider">
            Industrial Incident Triage & Root-Cause Center
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time anomaly monitoring, multi-source evidence synthesis and human-in-the-loop decision support
          </p>
        </div>
      </div>

      <IncidentList />
    </div>
  );
};