import React from 'react';
import { Sparkles, ArrowRight, BookOpen, Brain, Play, CheckCircle2, X } from 'lucide-react';
import { api } from '../../services/api';

export default function NextActionBanner({ recommendations = [], onTriggerAction, onDismiss }) {
  const activeRec = recommendations.find(r => !r.isDismissed);
  if (!activeRec) return null;

  let Icon = Sparkles;
  let actionLabel = 'Take Next Step';
  let badgeColor = 'bg-brand-500/20 text-brand-300 border-brand-500/30';

  if (activeRec.actionType === 'start_quiz') {
    Icon = Brain;
    actionLabel = 'Start Practice Quiz';
    badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
  } else if (activeRec.actionType === 'open_material') {
    Icon = BookOpen;
    actionLabel = 'Review Cited Section';
    badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
  } else if (activeRec.actionType === 'open_tutor') {
    Icon = Sparkles;
    actionLabel = 'Explore with Tutor';
    badgeColor = 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
  }

  return (
    <div className="rounded-2xl p-5 bg-gradient-to-r from-brand-950/60 via-dark-800 to-indigo-950/40 border border-brand-500/30 shadow-xl shadow-brand-500/10 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-slide-up">
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 flex-shrink-0 mt-0.5">
          <Icon className="w-5 h-5" />
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border text-brand-300 bg-brand-500/10 border-brand-500/20">
              Recommended Next Action
            </span>
            <span className="text-xs font-bold text-white">{activeRec.title}</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            {activeRec.description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
        {onTriggerAction && (
          <button
            onClick={() => onTriggerAction(activeRec)}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition flex items-center gap-1.5"
          >
            <span>{actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}

        {onDismiss && (
          <button
            onClick={() => onDismiss(activeRec.id)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition"
            title="Dismiss recommendation"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
