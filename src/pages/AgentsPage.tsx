import React from 'react';
import { AgentActivity } from '../components/agents/AgentActivity';

export const AgentsPage: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <AgentActivity />
    </div>
  );
};