import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Code2,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function DsaVisualizerModal({
  isOpen,
  onClose,
  dijkstraTrace = [],
  graph,
  startNode,
  endNode,
  calculatedDistance,
}) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentStepIdx(0);
      setIsPlaying(false);
    }
  }, [isOpen, dijkstraTrace]);

  useEffect(() => {
    let timer = null;
    if (isPlaying && dijkstraTrace.length > 0) {
      timer = setInterval(() => {
        setCurrentStepIdx((prev) => {
          if (prev < dijkstraTrace.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 1200);
    }
    return () => clearInterval(timer);
  }, [isPlaying, dijkstraTrace.length]);

  if (!isOpen) return null;

  const currentStep = dijkstraTrace[currentStepIdx] || null;
  const totalSteps = dijkstraTrace.length;

  const handleNext = () => {
    if (currentStepIdx < totalSteps - 1) {
      sounds.playClick();
      setCurrentStepIdx(currentStepIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      sounds.playClick();
      setCurrentStepIdx(currentStepIdx - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-4xl w-full p-5 shadow-2xl space-y-4 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Dijkstra Algorithm Trace &amp; Heap Inspector
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                  Step {currentStepIdx + 1} of {Math.max(1, totalSteps)}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Visualizing Priority Queue operations, edge relaxation, and predecessor tracking
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Controller */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentStepIdx(0)}
              disabled={currentStepIdx === 0}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
              title="First Step"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrev}
              disabled={currentStepIdx === 0}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
              title="Previous Step"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isPlaying ? 'Pause' : 'Auto Play'}
            </button>
            <button
              onClick={handleNext}
              disabled={currentStepIdx >= totalSteps - 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
              title="Next Step"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentStepIdx(totalSteps - 1)}
              disabled={currentStepIdx >= totalSteps - 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
              title="Last Step"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs text-slate-300 font-medium">
            Route: <span className="text-emerald-400 font-bold">{startNode}</span> ➔{' '}
            <span className="text-rose-400 font-bold">{endNode}</span> | Total Distance:{' '}
            <span className="font-mono text-sky-400 font-bold">{calculatedDistance} m</span>
          </div>
        </div>

        {/* Current Step Explanation Box */}
        {currentStep && (
          <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-xs text-indigo-200">
            <span className="font-bold text-indigo-400 uppercase tracking-wider text-[10px] block mb-1">
              Step Action:
            </span>
            <p className="font-medium text-slate-200">{currentStep.description}</p>
          </div>
        )}

        {/* Two-Column Grid: Min-Heap state & Relaxation Table */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0 overflow-hidden">
          {/* Column 1: Binary Min-Heap Priority Queue snapshot */}
          <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-950/60 p-3 overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Layers className="w-3.5 h-3.5" />
                Min-Priority Queue (Binary Heap)
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {currentStep?.heapSnapshot?.length || 0} queued
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pt-2 pr-1 custom-scrollbar">
              {currentStep?.heapSnapshot && currentStep.heapSnapshot.length > 0 ? (
                currentStep.heapSnapshot.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-slate-800 text-slate-400 font-mono text-[10px] flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <span className="font-medium text-slate-200">
                        {graph.getVertex(item.node)?.name || item.node}
                      </span>
                    </div>
                    <span className="font-mono text-sky-400 font-bold text-xs">
                      {item.distance.toFixed(1)} m
                    </span>
                  </div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-500">
                  Heap is empty (all reachable vertices finalized)
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Distance & Predecessor State Table */}
          <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-950/60 p-3 overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5 text-sky-400">
                <Code2 className="w-3.5 h-3.5" />
                Distance &amp; Predecessor Array
              </span>
              <span className="text-[10px] text-slate-500">dist[v] &amp; prev[v]</span>
            </div>

            <div className="flex-1 overflow-y-auto pt-2 pr-1 custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 text-[10px] uppercase font-bold">
                    <th className="pb-1.5">Node</th>
                    <th className="pb-1.5">dist[v]</th>
                    <th className="pb-1.5">prev[v]</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {currentStep &&
                    Object.keys(currentStep.distances || {}).map((nodeId) => {
                      const d = currentStep.distances[nodeId];
                      const p = currentStep.predecessors[nodeId];
                      const isCurrent = currentStep.current === nodeId;
                      return (
                        <tr
                          key={nodeId}
                          className={`hover:bg-slate-800/40 transition-colors ${
                            isCurrent ? 'bg-amber-500/10 text-amber-300 font-bold' : 'text-slate-300'
                          }`}
                        >
                          <td className="py-1.5 font-sans truncate max-w-[120px]">
                            {graph.getVertex(nodeId)?.name || nodeId}
                          </td>
                          <td className="py-1.5">
                            {d === Infinity ? (
                              <span className="text-slate-500 font-sans">∞</span>
                            ) : (
                              <span className="text-emerald-400">{d.toFixed(1)} m</span>
                            )}
                          </td>
                          <td className="py-1.5 text-slate-400 text-[11px] truncate max-w-[90px]">
                            {p ? graph.getVertex(p)?.name || p : 'null'}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400">
          <span>
            Time Complexity: <strong className="text-indigo-400 font-mono">O((V + E) log V)</strong> using binary min-heap
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
