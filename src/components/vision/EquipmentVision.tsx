import React, { useState, useEffect, useRef } from 'react';
import { visionApi } from '../../api/visionApi';
import { EquipmentImageSample } from '../../types/vision';
import { useCopilot } from '../../context/CopilotContext';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  ArrowRight,
  Eye,
  Flame,
  Activity,
  CheckCircle2,
  AlertOctagon,
  Scan,
} from 'lucide-react';
import { Modal } from '../common/Modal';

export const EquipmentVision: React.FC = () => {
  const navigate = useNavigate();
  const { activeMachine } = useCopilot();
  const [samples, setSamples] = useState<EquipmentImageSample[]>([]);
  const [activeSample, setActiveSample] = useState<EquipmentImageSample | null>(null);
  const [viewMode, setViewMode] = useState<'visible' | 'thermal' | 'heatmap'>('visible');
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    visionApi.getSamples().then((data) => {
      setSamples(data);
      if (data.length > 0) setActiveSample(data[0]);
    });
  }, []);

  const sample = activeSample || {
    id: 'sample-1',
    title: 'GT-01 Stage 4 Compressor Blade Fatigue Crack',
    machineId: 'GT-01',
    component: 'Compressor Blade (Stage 4)',
    timestamp: '2026-09-04T01:32:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
    imageType: 'visible' as const,
    defects: [
      {
        id: 'd-1',
        label: 'Crack Detected',
        severity: 'critical' as const,
        confidence: 96.0,
        box: { x: 38, y: 32, width: 24, height: 35 },
        location: 'Rotor Blade #14 (Leading Edge)',
        metric: 'Crack Length: 0.88 mm (High-Cycle Fatigue)',
        recommendation: 'Perform immediate eddy-current NDT verification and borescope blade replacement.',
        standardsRef: 'ASME Sec V Art 8 / GE GEK-10756',
        sopId: 'doc-sop-gt01-brg4',
      },
    ],
    ambientTempC: 38.4,
    vibrationMmS: 7.42,
    speedRpm: 3605,
    operatingHours: 18450,
  };

  const primaryDefect = sample.defects[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      const customSample: EquipmentImageSample = {
        id: 'uploaded-' + Date.now(),
        title: file.name,
        machineId: activeMachine.id,
        component: 'Custom Equipment Component',
        timestamp: new Date().toISOString(),
        imageUrl: previewUrl,
        imageType: 'visible',
        ambientTempC: 32.0,
        vibrationMmS: 5.2,
        speedRpm: 3600,
        operatingHours: 12000,
        defects: [
          {
            id: 'd-upload',
            label: 'Surface Anomaly Detected',
            severity: 'critical',
            confidence: 94.5,
            box: { x: 35, y: 30, width: 28, height: 38 },
            location: 'Surface Stress Concentration',
            metric: 'Visual Texture Variance > 82%',
            recommendation: 'Perform immediate physical inspection and ultrasonic test.',
            standardsRef: 'ISO 9712 / ASME Sec VIII',
            sopId: 'doc-sop-gt01-brg4',
          },
        ],
      };
      setSamples((prev) => [customSample, ...prev]);
      setActiveSample(customSample);
    }
  };

  return (
    <div className="space-y-4">
      {/* Sub-Header matching reference Screen 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#0c162b] border border-[#182747] px-4 py-2.5 rounded-xl text-xs font-mono">
        <div className="text-slate-300 flex items-center gap-2">
          <Scan className="h-4 w-4 text-cyan-400" />
          <span className="font-semibold text-slate-100">Active Inspection:</span>
          <span>GT-01 | Stage 4 Compressor</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-[11px]">04 Sep 2026 | 01:32 PM</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#162747] hover:bg-[#1f3764] text-cyan-300 text-[11px] font-mono border border-cyan-500/30 transition"
          >
            <Upload className="h-3 w-3" />
            <span>Upload Image</span>
          </button>
        </div>
      </div>

      {/* Main Dual-Column Layout matching Screen 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Equipment Image Viewport + View Switcher (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          {/* Main Inspection Image Viewport with Bounding Box */}
          <div className="relative rounded-xl overflow-hidden border border-[#182747] bg-[#070b16] min-h-[360px] max-h-[460px] flex items-center justify-center group shadow-xl">
            <img
              src={sample.imageUrl}
              alt={sample.title}
              className={`w-full h-full object-cover max-h-[440px] block select-none transition-all duration-300 ${
                viewMode === 'thermal'
                  ? 'hue-rotate-180 contrast-125 saturate-200'
                  : viewMode === 'heatmap'
                  ? 'invert contrast-150 saturate-150'
                  : ''
              }`}
            />

            {/* Thermal / Heatmap color simulation overlays */}
            {viewMode === 'thermal' && (
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-950/60 via-purple-950/40 to-yellow-600/30 pointer-events-none mix-blend-color-dodge" />
            )}
            {viewMode === 'heatmap' && (
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 via-yellow-500/20 to-transparent pointer-events-none mix-blend-screen" />
            )}

            {/* Bounding Box: Crack Detected 96% matching Screen 3 */}
            {primaryDefect && (
              <div
                style={{
                  left: `${primaryDefect.box.x}%`,
                  top: `${primaryDefect.box.y}%`,
                  width: `${primaryDefect.box.width}%`,
                  height: `${primaryDefect.box.height}%`,
                }}
                className="absolute border-2 border-red-500 bg-red-500/10 shadow-lg shadow-red-500/30 rounded"
              >
                {/* Red Pill Tag above box */}
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded bg-red-600 text-white font-mono text-[11px] font-bold whitespace-nowrap shadow-md flex items-center gap-1">
                  <span>Crack Detected {primaryDefect.confidence.toFixed(0)}%</span>
                </div>
              </div>
            )}
          </div>

          {/* 3-View Switcher below image matching Screen 3 */}
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setViewMode('visible')}
              className={`flex flex-col items-center p-2 rounded-lg border transition ${
                viewMode === 'visible'
                  ? 'bg-[#12284c] border-cyan-500/60 text-cyan-300 shadow-md'
                  : 'bg-[#0c162b] border-[#182747] text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="h-12 w-full rounded overflow-hidden mb-1.5 border border-[#162744]">
                <img
                  src={sample.imageUrl}
                  alt="Visible"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[11px] font-mono font-medium">Visible Light</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('thermal')}
              className={`flex flex-col items-center p-2 rounded-lg border transition ${
                viewMode === 'thermal'
                  ? 'bg-[#12284c] border-cyan-500/60 text-cyan-300 shadow-md'
                  : 'bg-[#0c162b] border-[#182747] text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="h-12 w-full rounded overflow-hidden mb-1.5 border border-[#162744] bg-blue-900">
                <img
                  src={sample.imageUrl}
                  alt="Thermal"
                  className="w-full h-full object-cover hue-rotate-180 contrast-125 saturate-200"
                />
              </div>
              <span className="text-[11px] font-mono font-medium">Thermal Image</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('heatmap')}
              className={`flex flex-col items-center p-2 rounded-lg border transition ${
                viewMode === 'heatmap'
                  ? 'bg-[#12284c] border-cyan-500/60 text-cyan-300 shadow-md'
                  : 'bg-[#0c162b] border-[#182747] text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="h-12 w-full rounded overflow-hidden mb-1.5 border border-[#162744] bg-red-950">
                <img
                  src={sample.imageUrl}
                  alt="Heatmap"
                  className="w-full h-full object-cover invert contrast-150 saturate-150"
                />
              </div>
              <span className="text-[11px] font-mono font-medium">Defect Heatmap</span>
            </button>
          </div>
        </div>

        {/* Right Column: Detection Result Card matching Screen 3 (4 cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between rounded-xl bg-[#0c162b] border border-[#182747] p-5 shadow-lg space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-[#182747] pb-3 mb-4">
              <span className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">
                Detection Result
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-950/70 border border-red-800 text-red-400 text-[10px] font-mono font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                Defect Detected
              </span>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <span className="text-[10px] uppercase text-slate-400 block mb-0.5">Component</span>
                <span className="text-slate-100 font-semibold text-sm">
                  {sample.component}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase text-slate-400 block mb-0.5">Defect Type</span>
                <span className="text-slate-100 font-semibold text-sm">
                  Fatigue Crack
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase text-slate-400 block mb-0.5">Confidence</span>
                <span className="text-slate-100 font-bold text-base text-cyan-400">
                  {primaryDefect ? `${primaryDefect.confidence.toFixed(0)}%` : '96%'}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase text-slate-400 block mb-0.5">Location</span>
                <span className="text-slate-200 font-medium">
                  {primaryDefect ? primaryDefect.location : 'Rotor Blade #14 (Leading Edge)'}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase text-slate-400 block mb-0.5">Severity</span>
                <span className="inline-flex items-center gap-1.5 text-red-400 font-bold text-sm">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  High
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#182747] space-y-2">
            <button
              type="button"
              onClick={() => navigate('/incidents/GT-01-VIB')}
              className="w-full py-2.5 rounded-lg bg-[#1853ad] hover:bg-[#1e61c7] text-white text-xs font-semibold tracking-wide flex items-center justify-center gap-2 shadow-md shadow-blue-950/40 transition"
            >
              <span>View Full Analysis</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};