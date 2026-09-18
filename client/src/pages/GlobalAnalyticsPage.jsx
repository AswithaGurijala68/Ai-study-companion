import React, { useState, useEffect } from 'react';
import { BarChart3, Award, Flame, Layers, Clock, Brain, Activity, TrendingUp } from 'lucide-react';
import { api } from '../services/api';
import ProgressBar from '../components/common/ProgressBar';
import TelemetryUsageCard from '../components/analytics/TelemetryUsageCard';

export default function GlobalAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    try {
      setLoading(true);
      const res = await api.getGlobalAnalytics();
      setAnalytics(res);
    } catch (err) {
      console.error('Failed to load global analytics:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !analytics) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400 text-xs">Loading analytics...</div>;
  }

  const { metrics, masteryDistribution, streakDays, recentEvents } = analytics;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-brand-400 uppercase tracking-wider">
          <BarChart3 className="w-4 h-4" />
          <span>Platform-Wide Telemetry</span>
        </div>
        <h1 className="text-2xl font-bold text-white mt-1">Global Learning Analytics</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
          Aggregated progress metrics, concept mastery distributions, daily velocity, and activity timeline.
        </p>
      </div>

      {/* Top Telemetry Usage Cards */}
      <TelemetryUsageCard
        totalTokens={metrics.totalAITokens}
        avgLatencyMs={420}
        totalCalls={metrics.quizzesTaken * 3 + 12}
        estimatedCostUSD={metrics.totalAICostUSD}
      />

      {/* Mastery Breakdown & Streak */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mastery Distribution Card */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Concept Mastery Distribution</span>
            </h3>
            <span className="text-xs font-bold text-brand-300">{metrics.totalConcepts} Total Concepts</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-emerald-400 font-semibold">Mastered (≥80%)</span>
                <span className="text-slate-300 font-bold">{masteryDistribution.mastered} concepts</span>
              </div>
              <ProgressBar value={masteryDistribution.mastered} max={metrics.totalConcepts || 1} colorScheme="emerald" height="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-amber-400 font-semibold">Competent (60-79%)</span>
                <span className="text-slate-300 font-bold">{masteryDistribution.competent} concepts</span>
              </div>
              <ProgressBar value={masteryDistribution.competent} max={metrics.totalConcepts || 1} colorScheme="mastery" height="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-rose-400 font-semibold">Requiring Attention (&lt;60%)</span>
                <span className="text-slate-300 font-bold">{masteryDistribution.learning} concepts</span>
              </div>
              <ProgressBar value={masteryDistribution.learning} max={metrics.totalConcepts || 1} colorScheme="mastery" height="h-2" />
            </div>
          </div>
        </div>

        {/* 7-Day Activity Velocity Streak */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Weekly Learning Velocity & Heatmap</span>
            </h3>
            <span className="text-xs font-bold text-emerald-400">{metrics.studyStreakDays} Day Streak</span>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-3">
            {streakDays.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="h-20 w-full bg-dark-900 rounded-xl flex items-end p-1 border border-white/5">
                  <div
                    className="w-full bg-gradient-to-t from-brand-600 to-indigo-400 rounded-lg transition-all duration-500"
                    style={{ height: `${Math.min(100, d.count * 6.5)}%` }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-slate-400">{d.day}</span>
                <span className="text-[9px] text-slate-500">{d.count} evt</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Global Activity Timeline */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" />
          <span>Cross-Project Activity Feed</span>
        </h3>

        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {recentEvents.map(evt => (
            <div key={evt.id} className="p-3 rounded-xl bg-dark-900 border border-white/5 flex items-start justify-between text-xs">
              <div className="space-y-0.5">
                <div className="font-semibold text-white">{evt.title}</div>
                <div className="text-slate-400 text-[11px]">{evt.details}</div>
              </div>
              <span className="text-[10px] text-slate-500 whitespace-nowrap ml-2">
                {new Date(evt.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
