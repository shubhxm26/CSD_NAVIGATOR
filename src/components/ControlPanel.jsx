import React from 'react';
import {
  MapPin,
  Flag,
  Navigation,
  Crosshair,
  RotateCw,
  Gauge,
  Sparkles,
  Info,
  ChevronRight,
} from 'lucide-react';
import { ROOMS_DATA } from '../data/floorData';
import { sounds } from '../utils/soundEffects';

export default function ControlPanel({
  graph,
  startNode,
  setStartNode,
  endNode,
  setEndNode,
  onFindShortestPath,
  onOpenWhereAmINow,
  onRecalculateRoute,
  onResetNavigation,
  walkingSpeed,
  setWalkingSpeed,
  isNavigating,
  currentConfirmedNode,
  hasActiveRoute,
  routeError,
}) {
  const allRooms = ROOMS_DATA;

  // Preset scenarios for instant testing and demonstration
  const presets = [
    {
      name: "Bhise Mam's Cabin ➔ Class 2",
      start: 'bhise_cabin',
      dest: 'class2',
      tag: 'Across Floor',
    },
    {
      name: 'Washroom ➔ Lab 3',
      start: 'washroom',
      dest: 'lab3',
      tag: 'Adjacent (0.5m)',
    },
    {
      name: 'Passage (Entrance) ➔ Lab 4',
      start: 'passage_entrance',
      dest: 'lab4',
      tag: 'Corridor Loop',
    },
    {
      name: 'Lab 1 ➔ JVN Hall Door 2',
      start: 'lab1',
      dest: 'jvn_door2',
      tag: 'Diagonal Walk',
    },
  ];

  const handleApplyPreset = (preset) => {
    sounds.playClick();
    setStartNode(preset.start);
    setEndNode(preset.dest);
    onFindShortestPath(preset.start, preset.dest);
  };

  return (
    <div className="flex flex-col bg-[#111111] border border-[#2a2a2a] rounded-lg overflow-hidden">
      {/* [ Route Planning ] Section Header */}
      <div className="px-4 py-3 border-b border-[#2a2a2a]">
        <span className="font-mono text-[10px] text-[#555555] uppercase tracking-widest">[ Route Planning ]</span>
        <p className="text-xs text-[#888888] mt-0.5">Select origin and destination to compute shortest path.</p>
      </div>

      <div className="flex flex-col gap-4 p-4">
        {/* Start Location Selection */}
        <div className="space-y-1.5">
          <label className="font-mono text-[10px] uppercase tracking-widest text-[#555555] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#22c55e] inline-block" />
              Origin
            </span>
            {startNode === 'bhise_cabin' && (
              <span className="text-[10px] text-[#555555] font-mono">map ref default</span>
            )}
          </label>
          <div className="relative">
            <select
              value={startNode}
              onChange={(e) => {
                sounds.playClick();
                setStartNode(e.target.value);
              }}
              disabled={isNavigating}
              className="w-full bg-[#161616] border border-[#2a2a2a] rounded px-3 py-2 text-xs text-[#f0f0f0] font-mono focus:ring-1 focus:ring-amber-500 focus:outline-none focus:border-amber-500/50 disabled:opacity-40 transition-all cursor-pointer"
            >
              <option value="">-- Choose Starting Point --</option>
              {allRooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} {r.isDefaultStart ? "(Bhise Mam's Cabin - Marked in Plan)" : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Destination Location Selection */}
        <div className="space-y-1.5">
          <label className="font-mono text-[10px] uppercase tracking-widest text-[#555555] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ef4444] inline-block" />
            Destination
          </label>
          <div className="relative">
            <select
              value={endNode}
              onChange={(e) => {
                sounds.playClick();
                setEndNode(e.target.value);
              }}
              disabled={isNavigating}
              className="w-full bg-[#161616] border border-[#2a2a2a] rounded px-3 py-2 text-xs text-[#f0f0f0] font-mono focus:ring-1 focus:ring-amber-500 focus:outline-none focus:border-amber-500/50 disabled:opacity-40 transition-all cursor-pointer"
            >
              <option value="">-- Choose Destination --</option>
              {allRooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Action Buttons */}
        <div className="flex flex-col gap-2">
          {!isNavigating ? (
            <button
              onClick={() => {
                sounds.playClick();
                onFindShortestPath();
              }}
              disabled={!startNode || !endNode}
              className="w-full py-2.5 px-4 rounded bg-amber-500 text-black font-mono font-bold text-xs hover:bg-amber-400 active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Navigation className="w-3.5 h-3.5" />
              Find Shortest Path (Dijkstra)
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              {/* Where am I now? Button */}
              <button
                onClick={() => {
                  sounds.playClick();
                  onOpenWhereAmINow();
                }}
                className="w-full py-2.5 px-4 bg-[#161616] border border-amber-500/40 text-amber-400 hover:border-amber-500 hover:bg-amber-500/10 font-mono text-xs rounded flex items-center justify-center gap-2 transition-all"
              >
                <Crosshair className="w-3.5 h-3.5" />
                Where am I now? (Update Position)
              </button>

              {/* Recalculate Route Button */}
              <button
                onClick={() => {
                  sounds.playClick();
                  onRecalculateRoute();
                }}
                className="w-full py-2 px-3 bg-[#161616] border border-[#2a2a2a] text-[#888888] hover:text-[#f0f0f0] hover:border-[#3d3d3d] font-mono text-xs rounded flex items-center justify-center gap-1.5 transition-all"
              >
                <RotateCw className="w-3.5 h-3.5" />
                Recalculate Remaining Route
              </button>
            </div>
          )}
        </div>

        {/* Route Error Notification */}
        {routeError && (
          <div className="bg-[#161616] border border-red-900/60 rounded p-3 text-red-400 text-xs font-mono flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Routing Notice</p>
              <p className="text-[11px] text-red-300/90 mt-0.5">{routeError}</p>
            </div>
          </div>
        )}

        {/* Walking Speed Configuration */}
        <div className="pt-2 border-t border-[#2a2a2a] space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#555555] flex items-center gap-1.5">
              <Gauge className="w-3 h-3" />
              Walking Speed
            </span>
            <span className="text-amber-400 font-mono font-bold text-xs">
              {walkingSpeed.toFixed(1)} m/s
              <span className="text-[#555555] font-normal ml-1">({((walkingSpeed * 3600) / 1000).toFixed(1)} km/h)</span>
            </span>
          </div>
          <input
            type="range"
            min="0.6"
            max="2.0"
            step="0.1"
            value={walkingSpeed}
            onChange={(e) => setWalkingSpeed(parseFloat(e.target.value))}
            className="w-full h-1 bg-[#1c1c1c] rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-[10px] text-[#555555] font-mono">
            <span>Stroll (0.6)</span>
            <span>Normal (1.2)</span>
            <span>Brisk (2.0)</span>
          </div>
        </div>

        {/* Quick Test Demo Presets */}
        <div className="pt-2 border-t border-[#2a2a2a] space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#555555] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Quick Presets
            </span>
            <span className="text-[10px] text-[#555555] font-mono">demo shortcuts</span>
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleApplyPreset(p)}
                className="text-left px-2.5 py-1.5 rounded bg-[#0a0a0a] border border-[#2a2a2a] hover:border-amber-500/30 hover:bg-[#161616] transition-all flex items-center justify-between group"
              >
                <span className="text-[11px] text-[#888888] font-medium group-hover:text-[#f0f0f0] font-mono">
                  {p.name}
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#1c1c1c] text-[#555555] border border-[#2a2a2a] shrink-0 ml-1 font-mono">
                  {p.tag}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Manual Tracking Notice required by prompt item 8 */}
        <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded p-2.5 text-[11px] text-[#555555] font-mono flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-[#555555] shrink-0 mt-0.5" />
          <p className="leading-tight">
            Indoor positioning is <strong className="text-[#888888]">user-confirmed</strong>. As you walk between labs, click <em>"Where am I now?"</em> to update your live journey checkpoint.
          </p>
        </div>
      </div>
    </div>
  );
}
