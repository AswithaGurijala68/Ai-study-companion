import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { BookOpen, ChevronLeft, ChevronRight, Sparkles, FileText, Bookmark, Share2 } from 'lucide-react';
import { api } from '../../services/api';

export default function PdfReaderModal({ isOpen, onClose, material, onAskTutor, initialPage = 1 }) {
  const [chunks, setChunks] = useState([]);
  const [currentPage, setCurrentPage] = useState(initialPage || 1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && material) {
      loadDocumentData();
      if (initialPage) setCurrentPage(initialPage);
    }
  }, [isOpen, material, initialPage]);

  async function loadDocumentData() {
    try {
      setLoading(true);
      const res = await api.getMaterialChunks(material.id);
      setChunks(res.chunks || []);
    } catch (err) {
      console.error('Failed to load chunks:', err);
    } finally {
      setLoading(false);
    }
  }

  const maxPages = Math.max(1, material?.pageCount || Math.max(...chunks.map(c => c.pageNumber || 1), 1));
  const pageChunks = chunks.filter(c => (c.pageNumber || 1) === currentPage);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Document Reader: ${material?.title}`} maxWidth="max-w-5xl">
      <div className="space-y-4">
        {/* Reader Top Bar */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-dark-900 border border-white/5">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <FileText className="w-4 h-4 text-brand-400" />
            <span className="font-semibold text-white truncate max-w-xs">{material?.title}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">{material?.fileType || 'PDF Document'}</span>
          </div>

          {/* Page Navigator */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg bg-dark-800 text-slate-300 hover:text-white disabled:opacity-30 transition border border-white/5"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-white">
              Page {currentPage} of {maxPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(maxPages, p + 1))}
              disabled={currentPage >= maxPages}
              className="p-1.5 rounded-lg bg-dark-800 text-slate-300 hover:text-white disabled:opacity-30 transition border border-white/5"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Page Content View */}
        <div className="min-h-[50vh] max-h-[65vh] overflow-y-auto p-6 rounded-2xl bg-dark-900/90 border border-white/10 shadow-inner font-sans space-y-6">
          {loading ? (
            <div className="text-center py-20 text-slate-400 text-xs">Loading page content...</div>
          ) : pageChunks.length === 0 ? (
            <div className="text-center py-20 space-y-2">
              <div className="text-sm font-semibold text-slate-300">Page {currentPage} Content</div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {material?.summary || 'Standard document text and formulas extracted during OCR analysis.'}
              </p>
            </div>
          ) : (
            pageChunks.map((chunk, idx) => (
              <div key={idx} className="space-y-3 pb-6 border-b border-white/5 last:border-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-brand-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                    {chunk.sectionTitle || `Section ${idx + 1}`}
                  </h4>

                  {onAskTutor && (
                    <button
                      onClick={() => {
                        onAskTutor(`Explain section "${chunk.sectionTitle}" from Page ${currentPage} in detail.`);
                        onClose();
                      }}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-brand-600/20 text-brand-300 border border-brand-500/30 hover:bg-brand-600 hover:text-white transition flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Ask Tutor About This</span>
                    </button>
                  )}
                </div>

                <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {chunk.content}
                </p>

                {chunk.concepts && chunk.concepts.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {chunk.concepts.map((c, cIdx) => (
                      <span key={cIdx} className="text-[10px] px-2 py-0.5 rounded-full bg-dark-800 text-slate-400 border border-white/5">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
