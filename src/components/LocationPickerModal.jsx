import React, { useState } from 'react';
import { X, Crosshair, MapPin, Check, AlertCircle, Info } from 'lucide-react';
import { ROOMS_DATA, CORRIDOR_JUNCTIONS } from '../data/floorData';
import { sounds } from '../utils/soundEffects';

export default function LocationPickerModal({
  isOpen,
  onClose,
  currentConfirmedNode,
  calculatedPath,
  onConfirmNewLocation,
}) {
  const [selectedLocation, setSelectedLocation] = useState(currentConfirmedNode || '');

  if (!isOpen) return null;

  const allChoices = [
    { group: 'Rooms & Department Entrances', items: ROOMS_DATA },
    { group: 'Corridor Hallway Junctions', items: CORRIDOR_JUNCTIONS },
  ];

  const handleConfirm = () => {
    if (selectedLocation) {
      sounds.playClick();
      onConfirmNewLocation(selectedLocation);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Crosshair className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Where am I now?</h3>
              <p className="text-[11px] text-slate-400">
                Confirm your physical location to update live navigation
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

        {/* Indoor GPS disclaimer required by Section 8 of prompt */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed text-slate-400">
            <strong>Manual Checkpoint System:</strong> Indoor location tracking inside our 4th floor department is user-confirmed (not automatic GPS). Please pick the nearest room or corridor signpost you are currently standing next to.
          </div>
        </div>

        {/* Location Dropdown Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            Select your current confirmed checkpoint:
          </label>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
          >
            <option value="">-- Choose checkpoint --</option>
            {allChoices.map((group) => (
              <optgroup key={group.group} label={group.group}>
                {group.items.map((item) => {
                  const isOnPath = calculatedPath.includes(item.id);
                  return (
                    <option key={item.id} value={item.id}>
                      {item.name} {isOnPath ? '✓ (On planned route)' : ''}
                    </option>
                  );
                })}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Route status indicator for selected checkpoint */}
        {selectedLocation && (
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs">
            {calculatedPath.includes(selectedLocation) ? (
              <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                <Check className="w-3.5 h-3.5" />
                This location is on your planned route. Progress will advance smoothly!
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                You are off the original planned route. Dijkstra will compute a new shortest route from here!
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedLocation}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4" />
            Confirm Location &amp; Update Route
          </button>
        </div>
      </div>
    </div>
  );
}
