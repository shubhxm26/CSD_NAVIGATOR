import React, { useState } from 'react';
import { X, Sliders, RotateCcw, Save, AlertCircle, Check } from 'lucide-react';
import { INITIAL_EDGE_WEIGHTS, ROOM_DOOR_DISTANCE } from '../data/floorData';
import { sounds } from '../utils/soundEffects';

export default function EdgeSettingsModal({
  isOpen,
  onClose,
  currentEdgeWeights,
  onSaveEdgeWeights,
  doorDistance,
  setDoorDistance,
}) {
  const [weights, setWeights] = useState(
    currentEdgeWeights.map((e) => ({ ...e }))
  );
  const [doorDist, setLocalDoorDist] = useState(doorDistance);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleWeightChange = (id, newDist) => {
    const parsed = parseFloat(newDist);
    if (!isNaN(parsed) && parsed >= 0.1) {
      setWeights((prev) =>
        prev.map((e) => (e.id === id ? { ...e, distance: parsed } : e))
      );
    }
  };

  const handleResetDefaults = () => {
    sounds.playClick();
    setWeights(INITIAL_EDGE_WEIGHTS.map((e) => ({ ...e })));
    setLocalDoorDist(ROOM_DOOR_DISTANCE);
  };

  const handleSave = () => {
    sounds.playClick();
    onSaveEdgeWeights(weights);
    setDoorDistance(doorDist);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 600);
  };

  // Group edges by section
  const sections = ['A. Top Side', 'B. Left Side', 'C. Bottom Side', 'D. Right Side'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full p-5 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Corridor Distance Table &amp; Weights
              </h3>
              <p className="text-[11px] text-slate-400">
                Provisional walking segment measurements from the handwritten department sketch
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

        {/* Note */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Distances are provisional estimates taken from the department layout sketch. Adjust any segment distance below to see Dijkstra adapt shortest routes in real-time.
          </p>
        </div>

        {/* Editable Distance Table */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
          {sections.map((sectionName) => {
            const sectionEdges = weights.filter((e) => e.tableSection === sectionName);
            return (
              <div key={sectionName} className="space-y-1.5">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider px-1">
                  {sectionName}
                </h4>
                <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950/60 divide-y divide-slate-800/80">
                  {sectionEdges.map((edge) => (
                    <div
                      key={edge.id}
                      className="px-3 py-2 flex items-center justify-between text-xs hover:bg-slate-800/30 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {edge.sketchItemNo && (
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-mono flex items-center justify-center">
                            #{edge.sketchItemNo}
                          </span>
                        )}
                        <div>
                          <span className="font-medium text-slate-200">{edge.label}</span>
                          {edge.isPlaceholder && (
                            <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              Configurable Placeholder
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          max="20"
                          value={edge.distance}
                          onChange={(e) => handleWeightChange(edge.id, e.target.value)}
                          className="w-16 px-2 py-1 text-center font-mono font-bold text-xs bg-slate-900 border border-slate-700 rounded-lg text-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        />
                        <span className="text-[11px] text-slate-500 font-medium">metres</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Doorway Threshold Setting */}
          <div className="space-y-1.5 pt-2">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider px-1">
              Room Access Thresholds
            </h4>
            <div className="rounded-xl border border-slate-800 p-3 bg-slate-950/60 flex items-center justify-between text-xs">
              <div>
                <span className="font-medium text-slate-200">Room Doorway Transition Distance</span>
                <p className="text-[10px] text-slate-400">
                  Walking distance from inside room center across doorway to corridor junction
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.1"
                  min="0.0"
                  max="2.0"
                  value={doorDist}
                  onChange={(e) => setLocalDoorDist(parseFloat(e.target.value) || 0)}
                  className="w-16 px-2 py-1 text-center font-mono font-bold text-xs bg-slate-900 border border-slate-700 rounded-lg text-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="text-[11px] text-slate-500 font-medium">metres</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            onClick={handleResetDefaults}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Sketch Defaults
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-lg"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" /> Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save &amp; Recalculate
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
