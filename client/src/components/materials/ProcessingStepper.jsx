import React from 'react';
import { Clock, Cpu, FileSearch, Sparkles, Database, CheckCircle2, AlertCircle } from 'lucide-react';

const STAGES = [
  { id: 'QUEUED', label: 'Queued', icon: Clock, threshold: 10 },
  { id: 'PROCESSING', label: 'OCR & Parsing', icon: Cpu, threshold: 30 },
  { id: 'EXTRACTING', label: 'Concept Extraction', icon: FileSearch, threshold: 55 },
  { id: 'INDEXING', label: 'Vector & Search Indexing', icon: Database, threshold: 80 },
  { id: 'READY', label: 'Ready for Tutor & Quiz', icon: CheckCircle2, threshold: 100 }
];

export default function ProcessingStepper({ status = 'QUEUED', progress = 0, errorMessage }) {
  if (status === 'FAILED') {
    return (
      <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
        <div>
          <span className="font-semibold">Processing Failed: </span>
          <span>{errorMessage || 'Document parsing encountered an error.'}</span>
        </div>
      </div>
    );
  }

  const currentIdx = STAGES.findIndex(s => s.id === status);
  const activeIdx = currentIdx === -1 ? (progress >= 100 ? 4 : 1) : currentIdx;

  return (
    <div className="w-full py-2">
      <div className="flex items-center justify-between relative">
        {/* Background connector line */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-0.5 bg-dark-900 z-0" />
        <div 
          className="absolute top-1/2 left-0 -translate-y-1/2 h-0.5 bg-gradient-to-r from-brand-600 to-emerald-500 transition-all duration-700 z-0"
          style={{ width: `${(activeIdx / (STAGES.length - 1)) * 100}%` }}
        />

        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isDone = idx < activeIdx || status === 'READY';
          const isCurrent = idx === activeIdx && status !== 'READY';

          return (
            <div key={stage.id} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center border transition duration-300 ${
                  isDone
                    ? 'bg-emerald-500 border-emerald-400 text-dark-900 shadow-md shadow-emerald-500/30'
                    : isCurrent
                    ? 'bg-brand-600 border-brand-400 text-white animate-pulse shadow-md shadow-brand-500/40'
                    : 'bg-dark-800 border-white/10 text-slate-500'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className={`text-[10px] mt-1.5 font-medium whitespace-nowrap hidden sm:block ${
                isDone ? 'text-emerald-400' : isCurrent ? 'text-brand-300 font-bold' : 'text-slate-500'
              }`}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
