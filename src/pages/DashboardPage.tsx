import React, { useState } from 'react';
import { useCopilot } from '../context/CopilotContext';
import { TelemetryCard } from '../components/dashboard/TelemetryCard';
import { ActiveIncidentBanner } from '../components/dashboard/ActiveIncidentBanner';
import { RecentTrendsChart } from '../components/dashboard/RecentTrendsChart';
import { EquipmentHealthDonut } from '../components/dashboard/EquipmentHealthDonut';
import { QuickActionsCard } from '../components/dashboard/QuickActionsCard';
import { ChatWorkbench } from '../components/chat/ChatWorkbench';
import { MessageSquare, X } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { activeMachine } = useCopilot();
  const [showCopilotDrawer, setShowCopilotDrawer] = useState(false);

  return (
    <div className="p-5 max-w-[1600px] mx-auto space-y-4">
      {/* Top 4 Telemetry Cards matching Screen 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <TelemetryCard
          label="RPM"
          value="3605"
          status="Normal"
          iconType="rpm"
        />
        <TelemetryCard
          label="Temperature"
          value="542.8 °C"
          status="Normal"
          iconType="temperature"
        />
        <TelemetryCard
          label="Vibration"
          value="7.42 mm/s"
          status="High"
          iconType="vibration"
        />
        <TelemetryCard
          label="Pressure"
          value="18.4 bar"
          status="Normal"
          iconType="pressure"
        />
      </div>

      {/* Prominent Active Incident Banner matching Screen 1 */}
      <ActiveIncidentBanner
        equipmentName="GT-01 (Frame 9F)"
        severity="High"
        detectedAt="12:34 PM"
        incidentId="GT-01-VIB"
      />

      {/* Bottom 3 Columns matching Screen 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Column 1: Recent Trends (5 cols) */}
        <div className="lg:col-span-5 h-[230px]">
          <RecentTrendsChart />
        </div>

        {/* Column 2: Equipment Health Donut (4 cols) */}
        <div className="lg:col-span-4 h-[230px]">
          <EquipmentHealthDonut />
        </div>

        {/* Column 3: Quick Actions (3 cols) */}
        <div className="lg:col-span-3 h-[230px]">
          <QuickActionsCard />
        </div>
      </div>

      {/* Floating Copilot AI Assistant Trigger */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setShowCopilotDrawer(!showCopilotDrawer)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shadow-xl shadow-cyan-950/60 transition active:scale-95 border border-cyan-400"
        >
          <MessageSquare className="h-4 w-4" />
          <span>{showCopilotDrawer ? 'Close AI Workbench' : 'Open AI Workbench'}</span>
        </button>
      </div>

      {/* Slide-over Copilot Drawer */}
      {showCopilotDrawer && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[500px] z-50 bg-[#080f21] border-l border-[#1b2b4d] shadow-2xl flex flex-col p-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1b2b4d] mb-2">
            <span className="text-xs font-bold text-slate-100 font-mono">
              KAVACHA Interactive AI Assistant
            </span>
            <button
              onClick={() => setShowCopilotDrawer(false)}
              className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-[#14223f]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 min-h-0">
            <ChatWorkbench />
          </div>
        </div>
      )}
    </div>
  );
};