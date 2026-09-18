import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { FileText, Search, Tag, Bookmark, Layers } from 'lucide-react';
import { api } from '../../services/api';

export default function ChunkViewerModal({ isOpen, onClose, material }) {
  const [chunks, setChunks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && material) {
      loadChunks();
    }
  }, [isOpen, material]);

  async function loadChunks() {
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

  const filteredChunks = chunks.filter(c => 
    c.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.sectionTitle && c.sectionTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.concepts && c.concepts.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Indexed Knowledge Chunks: ${material?.title}`} maxWidth="max-w-4xl">
      <div className="space-y-4">
        {/* Search & Metadata Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search indexed snippets..."
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-dark-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="px-2.5 py-1 rounded-lg bg-dark-900 border border-white/5 font-semibold text-slate-300">
              {chunks.length} Extracted Chunks
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-dark-900 border border-white/5 text-slate-400">
              ~{chunks.reduce((acc, cur) => acc + (cur.tokenCount || 0), 0)} Tokens
            </span>
          </div>
        </div>

        {/* Chunks List */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Loading chunks...</div>
          ) : filteredChunks.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">No matching chunks found.</div>
          ) : (
            filteredChunks.map((chunk, index) => (
              <div
                key={chunk.id || index}
                className="p-4 rounded-xl bg-dark-900/70 border border-white/5 hover:border-brand-500/30 transition space-y-2"
              >
                {/* Header: Page & Section */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-brand-500/20 text-brand-300 border border-brand-500/30 text-[10px] font-bold">
                      Page {chunk.pageNumber}
                    </span>
                    <span className="text-xs font-semibold text-white truncate max-w-sm">
                      {chunk.sectionTitle || 'Document Excerpt'}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-500 font-mono">
                    {chunk.tokenCount || 75} tokens
                  </span>
                </div>

                {/* Content snippet */}
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {chunk.content}
                </p>

                {/* Concepts Tags */}
                {chunk.concepts && chunk.concepts.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {chunk.concepts.map((concept, cIdx) => (
                      <span
                        key={cIdx}
                        className="text-[10px] font-medium px-2 py-0.5 rounded bg-dark-800 text-indigo-300 border border-indigo-500/20 flex items-center gap-1"
                      >
                        <Tag className="w-2.5 h-2.5" />
                        {concept}
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
