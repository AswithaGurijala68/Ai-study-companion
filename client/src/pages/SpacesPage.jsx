import React, { useState, useEffect } from 'react';
import { Layers, Plus, Search, Filter } from 'lucide-react';
import { api } from '../services/api';
import SpaceCard from '../components/spaces/SpaceCard';
import CreateSpaceModal from '../components/spaces/CreateSpaceModal';

export default function SpacesPage({ onNavigateToSpace }) {
  const [spaces, setSpaces] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSpaces();
  }, []);

  async function loadSpaces() {
    try {
      setLoading(true);
      const res = await api.getSpaces();
      setSpaces(res.spaces || []);
    } catch (err) {
      console.error('Failed to load spaces:', err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = spaces.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.tags && s.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-400 uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Learning Domains</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Learning Spaces</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Spaces represent broad areas of study (e.g. AI Engineering, Cloud Architecture, Biochemistry).
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Space</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter spaces by name, topic, or tag..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-dark-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition"
        />
      </div>

      {/* Spaces Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs">Loading spaces...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-2xl border border-white/10 space-y-3">
          <Layers className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Learning Spaces Found</h3>
          <p className="text-xs text-slate-400">Create your first Space to begin organizing your focused learning projects.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map(space => (
            <SpaceCard
              key={space.id}
              space={space}
              onSelect={() => onNavigateToSpace(space.id)}
            />
          ))}
        </div>
      )}

      {/* Create Space Modal */}
      <CreateSpaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={() => loadSpaces()}
      />
    </div>
  );
}
