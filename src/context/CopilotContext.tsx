import React, { createContext, useContext, useState, useEffect } from 'react';
import { MachineContext, ConfidenceMetrics } from '../types/security';
import { MessageCitation } from '../types/chat';
import { MOCK_MACHINES, MOCK_CONFIDENCE_METRICS } from '../api/mockData';

interface CopilotContextType {
  selectedMachineId: string;
  setSelectedMachineId: (id: string) => void;
  activeMachine: MachineContext;
  machines: MachineContext[];
  activeCitation: MessageCitation | null;
  setActiveCitation: (citation: MessageCitation | null) => void;
  confidence: ConfidenceMetrics;
  setConfidence: React.Dispatch<React.SetStateAction<ConfidenceMetrics>>;
  isAirGapEnforced: boolean;
  toggleAirGapEnforcement: () => void;
}

const CopilotContext = createContext<CopilotContextType | undefined>(undefined);

export const CopilotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [machines] = useState<MachineContext[]>(MOCK_MACHINES);
  const [selectedMachineId, setSelectedMachineId] = useState<string>('GT-01');
  const [activeCitation, setActiveCitation] = useState<MessageCitation | null>(null);
  const [confidence, setConfidence] = useState<ConfidenceMetrics>(MOCK_CONFIDENCE_METRICS);
  const [isAirGapEnforced, setIsAirGapEnforced] = useState<boolean>(true);

  const activeMachine = machines.find((m) => m.id === selectedMachineId) || machines[0];

  const toggleAirGapEnforcement = () => {
    setIsAirGapEnforced((prev) => !prev);
  };

  return (
    <CopilotContext.Provider
      value={{
        selectedMachineId,
        setSelectedMachineId,
        activeMachine,
        machines,
        activeCitation,
        setActiveCitation,
        confidence,
        setConfidence,
        isAirGapEnforced,
        toggleAirGapEnforcement,
      }}
    >
      {children}
    </CopilotContext.Provider>
  );
};

export const useCopilot = (): CopilotContextType => {
  const context = useContext(CopilotContext);
  if (!context) {
    throw new Error('useCopilot must be used within a CopilotProvider');
  }
  return context;
};