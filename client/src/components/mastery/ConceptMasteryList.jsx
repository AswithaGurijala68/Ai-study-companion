import React, { useState } from 'react';
import { TrendingUp, Minus, AlertTriangle, Sparkles, Filter, CheckCircle2, Play, BookOpen } from 'lucide-react';
import ProgressBar from '../common/ProgressBar';

export default function ConceptMasteryList({ concepts = [], onPracticeConcept }) {
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = concepts.filter(c => {
    if (statusFilter === 'ALL') return true;
    return c.status === statusFilter;
  });

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-400" />
          <h3 className="text-base font-bold text-white">Concept Mastery & Growth Analysis</h3>
        </div>

        <div className="flex items-center gap-1.5 bg-dark-900 p-1 rounded-xl border border-white/5 text-xs">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1 rounded-lg transition font-medium ${
              statusFilter === 'ALL' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({concepts.length})
          </button>
          <button
            onClick={() => setStatusFilter('Improving')}
            className={`px-3 py-1 rounded-lg transition font-medium ${
              statusFilter === 'Improving' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Improving ({concepts.filter(c => c.status === 'Improving').length})
          </button>
          <button
            onClick={() => setStatusFilter('Stable')}
            className={`px-3 py-1 rounded-lg transition font-medium ${
              statusFilter === 'Stable' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Stable ({concepts.filter(c => c.status === 'Stable').length})
          </button>
          <button
            onClick={() => setStatusFilter('Requiring Attention')}
            className={`px-3 py-1 rounded-lg transition font-medium ${
              statusFilter === 'Requiring Attention' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Needs Attention ({concepts.filter(c => c.status === 'Requiring Attention').length})
          </button>
        </div>
      </div>

      {/* Concept Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((concept) => {
          let statusBadge = {
            label: 'Stable',
            icon: Minus,
            color: 'bg-amber-500/10 text-amber-300 border-amber-500/30'
          };

          if (concept.status === 'Improving') {
            statusBadge = {
              label: 'Improving',
              icon: TrendingUp,
              color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
            };
          } else if (concept.status === 'Requiring Attention' || concept.score < 60) {
            statusBadge = {
              label: 'Requiring Attention',
              icon: AlertTriangle,
              color: 'bg-rose-500/10 text-rose-300 border-rose-500/30'
            };
          }

          const StatusIcon = statusBadge.icon;

          return (
            <div
              key={concept.conceptId || concept.name}
              className="glass-card rounded-2xl p-5 border border-white/5 space-y-3 relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      {concept.category || 'Core Concept'}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-0.5">
                      {concept.name}
                    </h4>
                  </div>

                  <div className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${statusBadge.color}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    <span>{statusBadge.label}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {concept.description || 'Key architectural component extracted from project study materials.'}
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Mastery Level</span>
                  <span className={`font-bold ${concept.score >= 75 ? 'text-emerald-400' : concept.score >= 55 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {concept.score}%
                  </span>
                </div>

                <ProgressBar value={concept.score} colorScheme="mastery" height="h-2" />

                <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px] text-slate-400">
                  <span>Evidence Points: {concept.evidenceCount || 1}</span>
                  {onPracticeConcept && (
                    <button
                      onClick={() => onPracticeConcept(concept.conceptId || concept.id)}
                      className="font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition"
                    >
                      <Play className="w-3 h-3" />
                      <span>Practice Quiz</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
