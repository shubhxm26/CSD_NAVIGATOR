import React from 'react';
import {
  Compass,
  RotateCcw,
  Sliders,
  BookOpen,
  Code2,
  CheckCircle,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function Header({
  onReset,
  onOpenSettings,
  onOpenDsaDocs,
  onOpenVisualizer,
  onOpenTests,
  soundMuted,
  setSoundMuted,
}) {
  const toggleSound = () => {
    sounds.muted = !soundMuted;
    setSoundMuted(!soundMuted);
  };

  // Shared flat button style for all header action buttons
  const btnBase =
    'flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono border border-[#2a2a2a] bg-[#111111] text-[#888888] hover:border-[#3d3d3d] hover:text-[#f0f0f0] transition-colors';

  return (
    <header className="dot-grid bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-[#2a2a2a] sticky top-0 z-30 px-5 py-0 shadow-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-14 gap-4">
        {/* Branding */}
        <div className="flex items-center gap-3">
          {/* Amber square logo mark */}
          <div className="w-8 h-8 bg-amber-500 flex items-center justify-center rounded-sm shrink-0">
            <Compass className="w-4 h-4 text-black" />
          </div>
          <div>
            <span className="font-mono text-sm font-bold text-[#f0f0f0] tracking-tight">CSD_NAVIGATOR</span>
            <span className="font-mono text-[10px] text-[#555555] block leading-none mt-0.5">4TH FLOOR · DIJKSTRA + MIN-HEAP</span>
          </div>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-1.5">
          {/* Audio toggle */}
          <button
            onClick={toggleSound}
            className={`${btnBase} px-2`}
            title={soundMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
          >
            {soundMuted
              ? <VolumeX className="w-3.5 h-3.5 text-[#ef4444]" />
              : <Volume2 className="w-3.5 h-3.5 text-[#22c55e]" />}
          </button>

          {/* DSA Trace button — gets amber accent on hover */}
          <button
            onClick={onOpenVisualizer}
            className={`${btnBase} hover:border-amber-500/50 hover:text-amber-400`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dijkstra</span> Trace
          </button>

          {/* Verification Tests */}
          <button
            onClick={onOpenTests}
            className={btnBase}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Verification</span> Tests
          </button>

          {/* Distance Config / Settings */}
          <button
            onClick={onOpenSettings}
            className={btnBase}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Distances</span>
          </button>

          {/* Academic DSA Docs */}
          <button
            onClick={onOpenDsaDocs}
            className={btnBase}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>DSA Viva Docs</span>
          </button>

          {/* Reset Navigation */}
          <button
            onClick={onReset}
            className={`${btnBase} border-[#2a2a2a] text-[#555555] hover:border-red-800 hover:text-red-400`}
            title="Reset active journey and location state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          {/* Terminal label */}
          <span className="font-mono text-[10px] text-[#333333] ml-3 hidden lg:block">[CSD NAV v1.0]</span>
        </div>
      </div>
    </header>
  );
}
