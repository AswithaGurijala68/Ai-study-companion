import React from 'react';
import Modal from '../common/Modal';
import { Download, Award, CheckCircle2, FileText, Target, Sparkles, Printer } from 'lucide-react';
import ProgressBar from '../common/ProgressBar';

export default function ExportReportModal({ isOpen, onClose, project, masteryOverview, roadmap, quizzes = [] }) {
  if (!isOpen) return null;

  function handlePrint() {
    window.print();
  }

  const concepts = masteryOverview?.concepts || [];
  const avgScore = masteryOverview?.averageScore || 0;
  const completedMilestones = roadmap?.milestones?.filter(m => m.status === 'completed') || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Learning Progress & Mastery Certificate" maxWidth="max-w-3xl">
      <div className="space-y-6 text-slate-100 font-sans p-2">
        {/* Printable Report Header */}
        <div className="p-6 rounded-2xl bg-gradient-to-tr from-dark-900 via-brand-950/40 to-dark-900 border border-brand-500/30 text-center space-y-3 relative overflow-hidden">
          <div className="w-12 h-12 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center mx-auto">
            <Award className="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
              StudyFlow AI • Learning Progress Report
            </span>
            <h2 className="text-xl font-bold text-white mt-2">{project?.name}</h2>
            <p className="text-xs text-slate-400 mt-1">
              Generated for <span className="text-white font-semibold">Alex Chen</span> on {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="flex justify-center gap-8 pt-2 text-xs">
            <div>
              <div className="text-2xl font-black text-emerald-400">{avgScore}%</div>
              <div className="text-[10px] text-slate-400">Current Mastery</div>
            </div>
            <div>
              <div className="text-2xl font-black text-white">{project?.targetMastery || 85}%</div>
              <div className="text-[10px] text-slate-400">Target Goal</div>
            </div>
            <div>
              <div className="text-2xl font-black text-purple-400">{quizzes.length}</div>
              <div className="text-[10px] text-slate-400">Quizzes Taken</div>
            </div>
          </div>
        </div>

        {/* Goal Summary */}
        <div className="p-4 rounded-xl bg-dark-900 border border-white/5 space-y-1 text-xs">
          <div className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-brand-400" />
            <span>Learning Goal:</span>
          </div>
          <p className="text-slate-400 leading-relaxed">{project?.learningGoal}</p>
        </div>

        {/* Concept Mastery Breakdown */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Concept Mastery Breakdown ({concepts.length} concepts)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
            {concepts.map(c => (
              <div key={c.conceptId || c.name} className="p-3 rounded-xl bg-dark-900 border border-white/5 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="font-semibold text-white truncate max-w-[180px]">{c.name}</span>
                  <span className={`font-bold ${c.score >= 75 ? 'text-emerald-400' : c.score >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {c.score}%
                  </span>
                </div>
                <ProgressBar value={c.score} colorScheme="mastery" height="h-1.5" />
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/5 transition"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF Report</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
