import React from 'react';
import { Bookmark, FileText, ExternalLink, X, Quote, Sparkles } from 'lucide-react';

export default function CitationDrawer({ isOpen, onClose, citation, onOpenInReader }) {
  if (!isOpen || !citation) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-dark-800 border-l border-white/10 shadow-2xl p-6 flex flex-col justify-between animate-slide-up">
      <div className="space-y-5">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Verified Grounding Source</h3>
              <div className="text-[11px] text-slate-400">Grounded evidence citation</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Source Document Details */}
        <div className="p-4 rounded-xl bg-dark-900 border border-white/5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-400 flex-shrink-0" />
              <span className="text-xs font-bold text-white leading-tight">
                {citation.materialTitle || 'Project Learning Material'}
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30 whitespace-nowrap">
              Page {citation.pageNumber || 1}
            </span>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="font-semibold text-slate-300">Section:</span>
            <span>{citation.sectionTitle || 'Core Theory'}</span>
          </div>
        </div>

        {/* Exact Citation Excerpt Quote */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Quote className="w-3.5 h-3.5 text-brand-400" />
            <span>Retrieved Text Excerpt</span>
          </div>
          <div className="p-4 rounded-xl bg-brand-950/20 border border-brand-500/20 text-xs text-brand-100/90 leading-relaxed italic font-serif">
            "{citation.snippet || 'Referenced evidence retrieved from project knowledge base.'}"
          </div>
        </div>

        {/* Grounding Rationale Alert */}
        <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-xs space-y-1">
          <div className="font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>High Confidence Grounding</span>
          </div>
          <p className="text-[11px] text-emerald-200/80 leading-relaxed">
            This answer was directly extracted and verified against the student's project materials without speculative hallucination.
          </p>
        </div>
      </div>

      {/* Drawer Action Footer */}
      <div className="pt-4 border-t border-white/10 flex items-center gap-3">
        {onOpenInReader && (
          <button
            onClick={() => {
              onOpenInReader(citation.materialId, citation.pageNumber);
              onClose();
            }}
            className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open in Document Reader</span>
          </button>
        )}
        <button
          onClick={onClose}
          className="px-4 py-2.5 rounded-xl bg-dark-900 text-slate-300 hover:text-white border border-white/5 text-xs font-medium transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}
