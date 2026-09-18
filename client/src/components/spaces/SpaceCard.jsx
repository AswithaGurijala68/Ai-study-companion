import React from 'react';
import { Brain, Server, Dna, Atom, Code, Sparkles, FolderKanban, FileText, Award, ArrowRight } from 'lucide-react';
import ProgressBar from '../common/ProgressBar';

const ICON_MAP = {
  Brain,
  Server,
  Dna,
  Atom,
  Code,
  Sparkles
};

export default function SpaceCard({ space, onSelect }) {
  const IconComponent = ICON_MAP[space.icon] || Brain;

  const colorVariants = {
    indigo: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/30 text-indigo-400',
    emerald: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
    rose: 'from-rose-500/20 to-pink-500/20 border-rose-500/30 text-rose-400',
    cyan: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400'
  };

  const currentVariant = colorVariants[space.color] || colorVariants.indigo;

  return (
    <div
      onClick={onSelect}
      className="glass-card rounded-2xl p-6 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
    >
      {/* Top Accent Gradient Bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${currentVariant.split(' ')[0]} to-transparent`} />

      <div>
        {/* Header with Icon */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${currentVariant} border flex items-center justify-center group-hover:scale-110 transition duration-300`}>
            <IconComponent className="w-6 h-6" />
          </div>

          <div className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-dark-900/80 border border-white/10 text-slate-300">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>{space.averageMastery || 0}% Mastery</span>
          </div>
        </div>

        {/* Space Title & Description */}
        <h3 className="text-lg font-bold text-white group-hover:text-brand-300 transition line-clamp-1">
          {space.name}
        </h3>
        <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
          {space.description || 'Broad learning area containing focused study projects.'}
        </p>

        {/* Tags */}
        {space.tags && space.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {space.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-dark-900 border border-white/5 text-slate-400">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Metrics */}
      <div className="mt-6 pt-4 border-t border-white/5 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <FolderKanban className="w-4 h-4 text-slate-500" />
            <span>{space.projectCount || 0} Projects</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-slate-500" />
            <span>{space.materialCount || 0} Materials</span>
          </div>
        </div>

        <ProgressBar value={space.averageMastery || 0} colorScheme="mastery" height="h-1.5" />

        <div className="flex items-center justify-between text-xs font-medium text-brand-400 group-hover:text-brand-300 pt-1">
          <span>Explore Projects</span>
          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
        </div>
      </div>
    </div>
  );
}
