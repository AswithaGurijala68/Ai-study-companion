import React from 'react';
import { Target, FileText, CheckCircle2, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import ProgressBar from '../common/ProgressBar';

export default function ProjectCard({ project, onSelect }) {
  const isMastered = (project.averageMastery || 0) >= (project.targetMastery || 85);

  return (
    <div
      onClick={onSelect}
      className="glass-card rounded-2xl p-6 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
    >
      <div>
        {/* Top Space Pill & Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20">
            {project.spaceName || 'Learning Project'}
          </span>

          <div className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-dark-900 border border-white/5">
            <Target className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-slate-300">Goal: {project.targetMastery || 85}%</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition line-clamp-1">
          {project.name}
        </h3>

        {/* Learning Goal */}
        <div className="mt-2.5 p-3 rounded-xl bg-dark-900/60 border border-white/5 text-xs text-slate-300 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="line-clamp-2 leading-relaxed">
            <span className="font-semibold text-slate-200">Goal: </span>
            {project.learningGoal || project.description}
          </div>
        </div>
      </div>

      {/* Mastery & Actions Footer */}
      <div className="mt-5 pt-4 border-t border-white/5 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Concept Mastery</span>
          <div className="flex items-center gap-1.5 font-bold">
            <span className={`text-sm ${(project.averageMastery || 0) >= 75 ? 'text-emerald-400' : (project.averageMastery || 0) >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
              {project.averageMastery || 0}%
            </span>
            <span className="text-slate-500 font-normal text-[11px]">/ {project.targetMastery || 85}%</span>
          </div>
        </div>

        <ProgressBar value={project.averageMastery || 0} colorScheme="mastery" height="h-2" />

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              {project.materialCount || 0} Docs
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              {project.conceptCount || 0} Concepts
            </span>
          </div>

          <span className="text-xs font-semibold text-brand-400 group-hover:text-brand-300 flex items-center gap-1">
            Workspace
            <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition" />
          </span>
        </div>
      </div>
    </div>
  );
}
