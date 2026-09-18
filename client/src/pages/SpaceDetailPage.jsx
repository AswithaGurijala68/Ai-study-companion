import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, FolderKanban, Award, Sparkles, Layers } from 'lucide-react';
import { api } from '../services/api';
import ProjectCard from '../components/projects/ProjectCard';
import CreateProjectModal from '../components/projects/CreateProjectModal';

export default function SpaceDetailPage({ spaceId, onBack, onNavigateToProject }) {
  const [space, setSpace] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  useEffect(() => {
    if (spaceId) loadSpaceDetails();
  }, [spaceId]);

  async function loadSpaceDetails() {
    try {
      setLoading(true);
      const res = await api.getSpace(spaceId);
      setSpace(res.space);
      setProjects(res.projects || []);
    } catch (err) {
      console.error('Failed to load space details:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400 text-xs">Loading space workspace...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Spaces</span>
      </button>

      {/* Space Hero Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-tr from-dark-900 via-dark-800 to-dark-900 border border-white/10 shadow-2xl space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Learning Space
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              {space?.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {space?.description}
            </p>
          </div>

          <button
            onClick={() => setIsProjectModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition flex items-center gap-2 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Learning Project</span>
          </button>
        </div>

        {/* Tags */}
        {space?.tags && (
          <div className="flex flex-wrap gap-2 pt-2">
            {space.tags.map((t, idx) => (
              <span key={idx} className="text-xs px-2.5 py-0.5 rounded-lg bg-dark-900 border border-white/5 text-slate-400">
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Projects Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Focused Learning Projects</h2>
            <p className="text-xs text-slate-400">Each project maintains strict isolated context, documents, and adaptive quizzes.</p>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-2xl border border-white/10 space-y-3">
            <FolderKanban className="w-8 h-8 text-slate-500 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Projects in this Space</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Create a project with a specific goal and upload study notes to activate the AI Companion.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map(proj => (
              <ProjectCard
                key={proj.id}
                project={proj}
                onSelect={() => onNavigateToProject(proj.id)}
              />
            ))}
          </div>
        )}
      </div>

      <CreateProjectModal
        isOpen={isProjectModalOpen}
        spaces={space ? [space] : []}
        defaultSpaceId={spaceId}
        onClose={() => setIsProjectModalOpen(false)}
        onCreated={() => loadSpaceDetails()}
      />
    </div>
  );
}
