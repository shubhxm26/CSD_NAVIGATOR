import React, { useEffect } from 'react';
import { X, Trophy, CheckCircle2, Footprints, Clock, RotateCcw, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/soundEffects';

export default function ArrivalModal({
  isOpen,
  onClose,
  startNode,
  endNode,
  graph,
  totalDistanceWalked,
  originalPlannedDistance,
  confirmedCheckpointsCount,
  onStartNewJourney,
}) {
  useEffect(() => {
    if (isOpen) {
      sounds.playArrival();
      try {
        // Fire celebration confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#10b981', '#f59e0b', '#ec4899', '#6366f1'],
        });
      } catch {
        // Ignore if confetti fails
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const startVertex = graph.getVertex(startNode);
  const endVertex = graph.getVertex(endNode);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 text-center relative overflow-hidden">
        {/* Background glow decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Trophy Celebration Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center mx-auto text-white shadow-xl shadow-emerald-500/30 ring-4 ring-emerald-500/20">
          <Trophy className="w-8 h-8 animate-bounce" />
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            Journey Completed
          </span>
          <h3 className="text-xl font-black text-white mt-0.5">
            You Have Arrived!
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Successfully navigated to{' '}
            <strong className="text-slate-200 font-bold">
              {endVertex ? endVertex.name : endNode}
            </strong>
          </p>
        </div>

        {/* Journey Summary Cards */}
        <div className="grid grid-cols-2 gap-2.5 text-left text-xs">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1">
              <Footprints className="w-3 h-3 text-emerald-400" /> Distance Walked
            </span>
            <span className="text-base font-bold font-mono text-emerald-400 mt-1 block">
              {totalDistanceWalked.toFixed(1)} <span className="text-xs font-normal text-slate-400">m</span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3 text-sky-400" /> Planned Route
            </span>
            <span className="text-base font-bold font-mono text-sky-400 mt-1 block">
              {originalPlannedDistance.toFixed(1)} <span className="text-xs font-normal text-slate-400">m</span>
            </span>
          </div>
        </div>

        {/* Path Journey Details */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
          <span className="text-slate-400">Starting Point:</span>
          <span className="font-semibold text-slate-200 truncate max-w-[180px]">
            {startVertex ? startVertex.name : startNode}
          </span>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={() => {
              sounds.playClick();
              onStartNewJourney();
              onClose();
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4" />
            Start a New Journey
          </button>
        </div>
      </div>
    </div>
  );
}
