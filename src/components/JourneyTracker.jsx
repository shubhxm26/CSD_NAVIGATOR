import React from 'react';
import {
  Compass,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Footprints,
  Clock,
  Milestone,
  Check,
  DoorOpen,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  Navigation,
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function JourneyTracker({
  graph,
  startNode,
  endNode,
  currentConfirmedNode,
  originalPlannedDistance,
  confirmedTravelledDistance,
  remainingDistance,
  progressPercent,
  estimatedTimeSeconds,
  isNavigating,
  hasDeviated,
  stepDirections = [],
  onConfirmArrival,
  onHoverStepNode,
}) {
  const getV = (id) => graph.getVertex(id);
  const startVertex = getV(startNode);
  const endVertex = getV(endNode);
  const currentVertex = getV(currentConfirmedNode || startNode);

  // Format seconds into minutes and seconds
  const formatTime = (totalSeconds) => {
    if (isNaN(totalSeconds) || totalSeconds <= 0) return '0s';
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.round(totalSeconds % 60);
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const isAtDestination =
    (currentConfirmedNode || startNode) === endNode && hasActiveRoute();

  function hasActiveRoute() {
    return originalPlannedDistance > 0 && endNode !== '';
  }

  // Get direction icon — muted colour to match terminal style
  const renderDirectionIcon = (iconName) => {
    switch (iconName) {
      case 'door-open':
        return <DoorOpen className="w-3.5 h-3.5 text-[#22c55e]" />;
      case 'door-closed':
        return <DoorOpen className="w-3.5 h-3.5 text-[#ef4444]" />;
      case 'arrow-right':
        return <ArrowRight className="w-3.5 h-3.5 text-[#3b82f6]" />;
      case 'arrow-left':
        return <ArrowLeft className="w-3.5 h-3.5 text-[#3b82f6]" />;
      case 'arrow-down':
        return <ArrowDown className="w-3.5 h-3.5 text-[#3b82f6]" />;
      case 'arrow-up':
        return <ArrowUp className="w-3.5 h-3.5 text-[#3b82f6]" />;
      default:
        return <Footprints className="w-3.5 h-3.5 text-[#888888]" />;
    }
  };

  return (
    <div className="flex flex-col bg-[#111111] border border-[#2a2a2a] rounded-lg overflow-hidden">
      {/* [ Navigation Journey ] Section Header */}
      <div className="px-4 py-3 border-b border-[#2a2a2a] flex items-center justify-between">
        <div>
          <span className="font-mono text-[10px] text-[#555555] uppercase tracking-widest">[ Navigation Journey ]</span>
          <p className="text-xs text-[#888888] mt-0.5">Real-time route cost &amp; waypoint progress</p>
        </div>

        {/* Status Badge — flat border-only style */}
        <div>
          {isAtDestination ? (
            <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-green-800/60 text-green-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Arrived
            </span>
          ) : isNavigating ? (
            <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-blue-800/60 text-blue-400 flex items-center gap-1">
              <Compass className="w-3 h-3 animate-spin-slow" /> En Route
            </span>
          ) : (
            <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-[#2a2a2a] text-[#555555]">
              Idle
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4">
        {/* From / To cards */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded p-2.5">
            <span className="font-mono text-[9px] text-[#555555] uppercase tracking-widest block">From</span>
            <span className="font-mono text-xs text-[#f0f0f0] font-semibold truncate block mt-0.5">
              {startVertex ? startVertex.name : 'Not set'}
            </span>
          </div>
          <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded p-2.5">
            <span className="font-mono text-[9px] text-[#555555] uppercase tracking-widest block">To Destination</span>
            <span className="font-mono text-xs text-[#f0f0f0] font-semibold truncate block mt-0.5">
              {endVertex ? endVertex.name : 'Not set'}
            </span>
          </div>
        </div>

        {/* Segmented Progress Bar */}
        {isNavigating && (
          <div className="space-y-1.5 p-3 rounded bg-[#0a0a0a] border border-[#2a2a2a]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#555555] flex items-center gap-1.5">
                <Milestone className="w-3 h-3" /> Journey Progress
              </span>
              <span className="font-mono font-bold text-amber-400">
                {progressPercent.toFixed(0)}%
              </span>
            </div>
            {/* Segmented bar */}
            <div className="relative w-full h-1.5 bg-[#1c1c1c] rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-amber-500 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
              />
              {/* Segment tick marks */}
              {[25, 50, 75].map((tick) => (
                <div
                  key={tick}
                  className="absolute top-0 h-full w-px bg-[#0a0a0a]"
                  style={{ left: `${tick}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-[#555555] font-mono pt-0.5">
              <span>Start</span>
              <span>{currentVertex ? currentVertex.name : 'Current'}</span>
              <span>Destination</span>
            </div>
          </div>
        )}

        {/* Metric Cards — instrument panel style */}
        <div className="grid grid-cols-3 gap-2">
          {/* Travelled Distance */}
          <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded p-2.5 flex flex-col">
            <span className="font-mono text-[9px] text-[#555555] uppercase tracking-widest block">
              Walked
            </span>
            <span className="font-mono text-base font-bold text-amber-400 mt-1">
              {confirmedTravelledDistance.toFixed(1)}
              <span className="font-mono text-[9px] text-[#555555] ml-1">m</span>
            </span>
          </div>

          {/* Remaining Distance */}
          <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded p-2.5 flex flex-col">
            <span className="font-mono text-[9px] text-[#555555] uppercase tracking-widest block">
              Remaining
            </span>
            <span className="font-mono text-base font-bold text-blue-400 mt-1">
              {remainingDistance.toFixed(1)}
              <span className="font-mono text-[9px] text-[#555555] ml-1">m</span>
            </span>
          </div>

          {/* Estimated Time */}
          <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded p-2.5 flex flex-col">
            <span className="font-mono text-[9px] text-[#555555] uppercase tracking-widest block">
              Est. Time
            </span>
            <span className="font-mono text-base font-bold text-[#f0f0f0] mt-1">
              {formatTime(estimatedTimeSeconds)}
            </span>
          </div>
        </div>

        {/* Deviation Notice */}
        {hasDeviated && (
          <div className="bg-[#161616] border border-amber-900/60 rounded p-2.5 text-amber-500 text-[11px] font-mono flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <div className="leading-tight">
              <span className="font-bold">Route Deviation Detected:</span> You confirmed a location outside the planned path. Dijkstra has recalculated the optimal remaining route from your current position.
            </div>
          </div>
        )}

        {/* Arrival Action Button */}
        {isNavigating && (
          <button
            onClick={() => {
              sounds.playArrival();
              onConfirmArrival();
            }}
            className={`w-full py-2.5 px-3 rounded font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              isAtDestination
                ? 'bg-amber-500 text-black hover:bg-amber-400'
                : 'bg-[#0a0a0a] border border-[#2a2a2a] text-[#555555] hover:border-[#3d3d3d] hover:text-[#888888]'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            I Have Reached Destination!
          </button>
        )}

        {/* Step-by-Step Directions — terminal list style */}
        <div className="flex-1 flex flex-col min-h-0 pt-2 border-t border-[#2a2a2a]">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#555555] flex items-center gap-1.5">
              <Navigation className="w-3 h-3" />
              Step Directions ({stepDirections.length})
            </span>
            <span className="font-mono text-[10px] text-[#555555]">
              {originalPlannedDistance.toFixed(1)} m total
            </span>
          </div>

          {stepDirections.length === 0 ? (
            <div className="p-6 text-center font-mono text-xs text-[#333333] border border-dashed border-[#2a2a2a] rounded">
              Select starting location and destination, then click Find Shortest Path to view walking directions.
            </div>
          ) : (
            <div className="max-h-56 overflow-y-auto space-y-1 custom-scrollbar">
              {stepDirections.map((step) => (
                <div
                  key={step.stepNumber}
                  onMouseEnter={() => onHoverStepNode && onHoverStepNode(step.to)}
                  onMouseLeave={() => onHoverStepNode && onHoverStepNode(null)}
                  className="flex items-start gap-2.5 p-2 rounded bg-[#0a0a0a] border border-[#2a2a2a] hover:border-amber-500/30 hover:bg-[#161616] transition-all cursor-pointer group"
                >
                  {/* Left amber accent bar */}
                  <div className="w-0.5 self-stretch bg-amber-500 opacity-0 group-hover:opacity-100 rounded transition-opacity shrink-0" />

                  {/* Step number in #01 format */}
                  <span className="font-mono text-[9px] text-[#555555] w-6 text-right shrink-0 group-hover:text-amber-500 mt-0.5 transition-colors">
                    #{String(step.stepNumber).padStart(2, '0')}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 text-[#888888] group-hover:text-[#f0f0f0] font-medium transition-colors">
                      {renderDirectionIcon(step.icon)}
                      <span className="truncate text-xs">{step.instruction}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-[#555555] mt-0.5 font-mono">
                      <span>From: {step.from}</span>
                      <span>•</span>
                      <span className="text-amber-400">+{step.distance.toFixed(1)} m</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
