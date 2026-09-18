import React, { useState, useEffect } from 'react';
import { User, Layers, Award, Target, Activity, Cpu, Sparkles, ChevronRight } from 'lucide-react';
import { api } from '../../services/api';
import ProgressBar from '../common/ProgressBar';

export default function LearnerJourneyInspector({ users = [] }) {
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id || 'user-1');
  const [journeyData, setJourneyData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedUserId) {
      loadJourney();
    }
  }, [selectedUserId]);

  async function loadJourney() {
    try {
      setLoading(true);
      const res = await api.inspectUserJourney(selectedUserId);
      setJourneyData(res);
    } catch (err) {
      console.error('Failed to load user journey:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-purple-400" />
            <span>Learner Journey Inspector</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Full diagnostic view of student learning paths, quiz history, concept mastery, and AI usage.
          </p>
        </div>

        {/* User Selector Dropdown */}
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          className="px-3.5 py-2 rounded-xl bg-dark-900 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
        >
          {users.map(u => (
            <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading learner journey...</div>
      ) : journeyData ? (
        <div className="space-y-6">
          {/* User Profile Card */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-dark-900 border border-white/5">
            <img
              src={journeyData.user?.avatar}
              alt={journeyData.user?.name}
              className="w-12 h-12 rounded-xl object-cover border border-white/10"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">{journeyData.user?.name}</h4>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {journeyData.user?.role}
                </span>
              </div>
              <div className="text-xs text-slate-400">{journeyData.user?.email}</div>
            </div>

            <div className="flex items-center gap-6 text-xs text-right">
              <div>
                <div className="font-bold text-white">{journeyData.spaces?.length || 0}</div>
                <div className="text-[10px] text-slate-500">Spaces</div>
              </div>
              <div>
                <div className="font-bold text-white">{journeyData.projects?.length || 0}</div>
                <div className="text-[10px] text-slate-500">Projects</div>
              </div>
              <div>
                <div className="font-bold text-emerald-400">{journeyData.quizzes?.length || 0}</div>
                <div className="text-[10px] text-slate-500">Quizzes</div>
              </div>
            </div>
          </div>

          {/* Active Projects & Mastery breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Projects List */}
            <div className="p-4 rounded-xl bg-dark-900 border border-white/5 space-y-3">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-brand-400" />
                <span>Learning Projects</span>
              </div>
              <div className="space-y-2">
                {journeyData.projects?.map(p => (
                  <div key={p.id} className="p-3 rounded-lg bg-dark-800 border border-white/5 space-y-1">
                    <div className="text-xs font-semibold text-white truncate">{p.name}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">{p.learningGoal}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Concept Mastery Distribution */}
            <div className="p-4 rounded-xl bg-dark-900 border border-white/5 space-y-3">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Concept Mastery State</span>
              </div>
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {journeyData.mastery?.map(m => (
                  <div key={m.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 truncate max-w-xs">{m.conceptName}</span>
                      <span className={`font-bold ${m.score >= 75 ? 'text-emerald-400' : m.score >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                        {m.score}% ({m.status})
                      </span>
                    </div>
                    <ProgressBar value={m.score} colorScheme="mastery" height="h-1.5" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Events Log for this User */}
          <div className="p-4 rounded-xl bg-dark-900 border border-white/5 space-y-3">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              <span>Learner Activity Timeline</span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {journeyData.events?.map(evt => (
                <div key={evt.id} className="flex items-start justify-between text-xs p-2 rounded-lg bg-dark-800/60 border border-white/5">
                  <div>
                    <span className="font-semibold text-white">{evt.title}: </span>
                    <span className="text-slate-400">{evt.details}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 whitespace-nowrap ml-2">
                    {new Date(evt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
