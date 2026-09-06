import React from 'react';

export const RecentTrendsChart: React.FC = () => {
  return (
    <div className="rounded-xl p-4 bg-[#0c162b] border border-[#182747] flex flex-col justify-between h-full">
      {/* Header & Legend */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">
          Recent Trends
        </span>

        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="flex items-center gap-1 text-red-400">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            Vibration
          </span>
          <span className="flex items-center gap-1 text-blue-400">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            Temperature
          </span>
          <span className="flex items-center gap-1 text-cyan-400">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            RPM
          </span>
        </div>
      </div>

      {/* SVG Multi-Line Chart Canvas */}
      <div className="relative w-full h-36 flex items-center justify-center">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 450 140">
          {/* Y Axis Grid lines */}
          <line x1="40" y1="15" x2="430" y2="15" stroke="#16233f" strokeWidth="1" strokeDasharray="3,3" />
          <text x="10" y="18" fill="#526487" fontSize="9" fontFamily="monospace">750</text>

          <line x1="40" y1="45" x2="430" y2="45" stroke="#16233f" strokeWidth="1" strokeDasharray="3,3" />
          <text x="10" y="48" fill="#526487" fontSize="9" fontFamily="monospace">500</text>

          <line x1="40" y1="75" x2="430" y2="75" stroke="#16233f" strokeWidth="1" strokeDasharray="3,3" />
          <text x="10" y="78" fill="#526487" fontSize="9" fontFamily="monospace">300</text>

          <line x1="40" y1="105" x2="430" y2="105" stroke="#16233f" strokeWidth="1" strokeDasharray="3,3" />
          <text x="15" y="108" fill="#526487" fontSize="9" fontFamily="monospace">20</text>

          <line x1="40" y1="120" x2="430" y2="120" stroke="#16233f" strokeWidth="1" />
          <text x="20" y="123" fill="#526487" fontSize="9" fontFamily="monospace">0</text>

          {/* Line 1: RPM (Cyan) - Constant high flatline with minor ripple */}
          <path
            d="M 50 25 C 100 24, 150 28, 200 25 C 250 23, 320 26, 420 25"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Line 2: Temperature (Blue) - Moderate baseline around 542°C */}
          <path
            d="M 50 68 C 110 74, 170 60, 240 68 C 300 72, 360 62, 420 65"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Line 3: Vibration (Red) - Sudden spike upwards after 12:00 */}
          <path
            d="M 50 102 C 100 100, 160 98, 220 90 C 270 65, 330 42, 420 32"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Points on Red line showing spike */}
          <circle cx="50" cy="102" r="3" fill="#ef4444" />
          <circle cx="220" cy="90" r="3" fill="#ef4444" />
          <circle cx="330" cy="42" r="3.5" fill="#ef4444" />
          <circle cx="420" cy="32" r="4.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />

          {/* Time Labels on X axis */}
          <text x="50" y="136" fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="middle">11:00</text>
          <text x="140" y="136" fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="middle">11:30</text>
          <text x="230" y="136" fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="middle">12:00</text>
          <text x="320" y="136" fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="middle">12:30</text>
          <text x="410" y="136" fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="middle">13:00</text>
        </svg>
      </div>
    </div>
  );
};