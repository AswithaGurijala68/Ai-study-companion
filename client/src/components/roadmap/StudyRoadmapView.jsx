import React, { useState, useEffect } from 'react';
import { MapPin, CheckCircle2, Clock, Circle, Sparkles, Plus, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import ProgressBar from '../common/ProgressBar';
import { useToast } from '../../context/ToastContext';

export default function StudyRoadmapView({ projectId, projectGoal }) {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    if (projectId) loadRoadmap();
  }, [projectId]);

  async function loadRoadmap() {
    try {
      setLoading(true);
      const res = await api.getRoadmap(projectId);
      setRoadmap(res.roadmap || null);
    } catch (err) {
      console.error('Failed to load roadmap:', err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(milestoneId, currentStatus) {
    const nextStatus = currentStatus === 'completed' 
      ? 'in_progress' 
      : currentStatus === 'in_progress' 
      ? 'completed' 
      : 'in_progress';

    try {
      const res = await api.updateMilestone(projectId, milestoneId, nextStatus);
      setRoadmap(res.roadmap);
      addToast({
        title: 'Milestone Updated',
        message: `Status changed to ${nextStatus.replace('_', ' ')}.`,
        type: 'info'
      });
    } catch (err) {
      addToast({ title: 'Update Failed', message: err.message, type: 'error' });
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-slate-400 text-xs">Loading study roadmap...</div>;
  }

  const milestones = roadmap?.milestones || [];
  const completedCount = milestones.filter(m => m.status === 'completed').length;
  const progressPct = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-brand-400" />
            <span>{roadmap?.title || 'AI Generated Study Roadmap'}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 max-w-lg">
            Personalized milestone track formulated around: "{projectGoal || 'Project Learning Goal'}".
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-semibold text-white">{completedCount} of {milestones.length} Completed</div>
            <div className="text-[10px] text-slate-400">{progressPct}% Overall Progress</div>
          </div>
          <div className="w-24">
            <ProgressBar value={progressPct} colorScheme="emerald" height="h-2" />
          </div>
        </div>
      </div>

      {/* Milestones Stepper Timeline */}
      <div className="space-y-4">
        {milestones.map((m, idx) => {
          const isCompleted = m.status === 'completed';
          const isInProgress = m.status === 'in_progress';

          return (
            <div
              key={m.id || idx}
              className={`p-4 rounded-xl border transition flex items-start gap-4 ${
                isCompleted
                  ? 'bg-dark-900/60 border-emerald-500/20 text-slate-300'
                  : isInProgress
                  ? 'bg-brand-950/20 border-brand-500/40 text-white shadow-md shadow-brand-500/10'
                  : 'bg-dark-900/40 border-white/5 text-slate-400'
              }`}
            >
              {/* Step indicator / Checkbox button */}
              <button
                type="button"
                onClick={() => toggleStatus(m.id, m.status)}
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border mt-0.5 transition ${
                  isCompleted
                    ? 'bg-emerald-500 border-emerald-400 text-dark-900'
                    : isInProgress
                    ? 'bg-brand-600 border-brand-400 text-white animate-pulse'
                    : 'bg-dark-800 border-white/10 text-slate-500 hover:border-brand-500'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isInProgress ? (
                  <Clock className="w-4 h-4" />
                ) : (
                  <span className="text-[11px] font-bold">{idx + 1}</span>
                )}
              </button>

              {/* Milestone Details */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`text-sm font-semibold ${isCompleted ? 'line-through text-slate-400' : 'text-white'}`}>
                    {m.title}
                  </h4>

                  <button
                    type="button"
                    onClick={() => toggleStatus(m.id, m.status)}
                    className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border transition ${
                      isCompleted
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : isInProgress
                        ? 'bg-brand-500/20 text-brand-300 border-brand-500/40'
                        : 'bg-dark-800 text-slate-400 border-white/5 hover:text-white'
                    }`}
                  >
                    {m.status.replace('_', ' ')}
                  </button>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {m.description}
                </p>

                {m.targetConcept && (
                  <div className="text-[10px] text-brand-400 font-medium pt-1">
                    🎯 Target Concept: {m.targetConcept}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
