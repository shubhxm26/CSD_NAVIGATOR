import React, { useState } from 'react';
import { X, BookOpen, ChevronRight, FileText, CheckCircle2 } from 'lucide-react';
import { DSA_EXPLANATIONS } from '../dsa/dsaDocs';
import { sounds } from '../utils/soundEffects';

export default function DsaDocsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('graphBasics');

  if (!isOpen) return null;

  const topics = [
    { id: 'graphBasics', label: '1. What is a Graph?' },
    { id: 'verticesAndEdges', label: '2. Vertices & Edges in CSD' },
    { id: 'whyWeighted', label: '3. Why Weighted Graph?' },
    { id: 'adjacencyList', label: '4. Adjacency List Structure' },
    { id: 'dijkstraStepByStep', label: "5. Dijkstra's Algorithm" },
    { id: 'minHeapImportance', label: '6. Min-Priority Queue Role' },
    { id: 'pathReconstruction', label: '7. Path Reconstruction' },
    { id: 'routeProgressMath', label: '8. Journey Tracking Math' },
    { id: 'cppCode', label: '9. C++ Source Code (DSA)' },
  ];

  const currentTopic = DSA_EXPLANATIONS[activeTab];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-4xl w-full p-5 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Academic DSA Explanation &amp; Viva Documentation
              </h3>
              <p className="text-[11px] text-slate-400">
                Core algorithms, data structures, and asymptotic complexity analysis
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

        {/* Content Body: Sidebar Tabs + Document Viewer */}
        <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0 overflow-hidden">
          {/* Navigation Sidebar */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-800 pr-0 md:pr-3 overflow-y-auto space-y-1 custom-scrollbar shrink-0">
            {topics.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  sounds.playClick();
                  setActiveTab(t.id);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                  activeTab === t.id
                    ? 'bg-sky-600/20 text-sky-300 border border-sky-500/40'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <span className="truncate">{t.label}</span>
                <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${activeTab === t.id ? 'text-sky-400' : 'text-slate-600'}`} />
              </button>
            ))}
          </div>

          {/* Document Content View */}
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
            {currentTopic && (
              <div className="space-y-3">
                <h4 className="text-base font-bold text-white border-b border-slate-800 pb-2">
                  {currentTopic.title}
                </h4>
                <div className="prose prose-invert max-w-none text-xs text-slate-300 leading-relaxed space-y-3 whitespace-pre-line font-sans">
                  {currentTopic.content}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
          <span className="text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Suitable for Viva Presentation &amp; Report Submission
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
}
