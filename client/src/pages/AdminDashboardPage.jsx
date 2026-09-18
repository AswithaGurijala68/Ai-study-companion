import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Award, 
  Activity, 
  User, 
  RotateCcw, 
  Sparkles, 
  Database, 
  Layers, 
  Clock, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LearnerJourneyInspector from '../components/admin/LearnerJourneyInspector';
import TelemetryLogTable from '../components/admin/TelemetryLogTable';
import AIEvalBenchmarkView from '../components/admin/AIEvalBenchmarkView';
import QueueWorkerMonitor from '../components/admin/QueueWorkerMonitor';
import TelemetryUsageCard from '../components/analytics/TelemetryUsageCard';
import { useToast } from '../context/ToastContext';

export default function AdminDashboardPage() {
  const { currentUser } = useAuth();
  const [adminData, setAdminData] = useState(null);
  const [activeAdminTab, setActiveAdminTab] = useState('telemetry'); // 'telemetry', 'evaluations', 'learners', 'queue'
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    loadAdminData();
  }, []);

  async function loadAdminData() {
    try {
      setLoading(true);
      const res = await api.getAdminDashboard();
      setAdminData(res);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleResetDatabase() {
    if (!window.confirm('Reset database to clean default sample seed state?')) return;
    try {
      await api.resetDatabase();
      addToast({
        title: 'Database Reset',
        message: 'Successfully seeded fresh data.',
        type: 'success'
      });
      loadAdminData();
    } catch (err) {
      addToast({ title: 'Reset Failed', message: err.message, type: 'error' });
    }
  }

  if (loading && !adminData) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400 text-xs">Loading admin operations platform...</div>;
  }

  const { metrics, users, recentAILogs, evaluations } = adminData || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header & Reset CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Administrative Operations & AI Observability</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Platform Admin Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Live telemetry, learner journey diagnostic auditing, benchmark evaluations, and queue health.
          </p>
        </div>

        <button
          onClick={handleResetDatabase}
          className="px-4 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition flex items-center gap-1.5"
        >
          <RotateCcw className="w-4 h-4 text-purple-400" />
          <span>Reset Sample Seed Data</span>
        </button>
      </div>

      {/* Top Platform Metrics */}
      <TelemetryUsageCard
        totalTokens={metrics?.totalTokens || 0}
        avgLatencyMs={metrics?.avgLatencyMs || 0}
        totalCalls={metrics?.totalAICalls || 0}
        estimatedCostUSD={metrics?.totalCostUSD || 0}
      />

      {/* Admin Nav Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 text-xs font-semibold overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveAdminTab('telemetry')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            activeAdminTab === 'telemetry'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>AI Inference Traces ({recentAILogs?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('evaluations')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            activeAdminTab === 'evaluations'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>AI Benchmark Evaluations ({evaluations?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('learners')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            activeAdminTab === 'learners'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Learner Journey Inspector</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('queue')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            activeAdminTab === 'queue'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Background Queue & Worker</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeAdminTab === 'telemetry' && (
        <TelemetryLogTable logs={recentAILogs || []} onRefresh={loadAdminData} />
      )}

      {activeAdminTab === 'evaluations' && (
        <AIEvalBenchmarkView evaluations={evaluations || []} onEvaluated={loadAdminData} />
      )}

      {activeAdminTab === 'learners' && (
        <LearnerJourneyInspector users={users || []} />
      )}

      {activeAdminTab === 'queue' && (
        <QueueWorkerMonitor />
      )}
    </div>
  );
}
