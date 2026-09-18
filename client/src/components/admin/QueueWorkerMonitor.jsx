import React, { useState, useEffect } from 'react';
import { Layers, Activity, CheckCircle2, AlertTriangle, Clock, RotateCcw, Cpu } from 'lucide-react';
import { api } from '../../services/api';
import ProgressBar from '../common/ProgressBar';

export default function QueueWorkerMonitor() {
  const [queueStatus, setQueueStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  async function loadQueue() {
    try {
      const res = await api.getQueueStatus();
      setQueueStatus(res);
    } catch (err) {
      console.error('Failed to fetch queue status:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading && !queueStatus) {
    return <div className="text-center py-12 text-slate-400 text-xs">Loading queue worker telemetry...</div>;
  }

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <span>Asynchronous Background Queue & Worker Engine</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Decoupled job processor executing document chunking, embeddings, mastery recalculation, and retries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Worker Active</span>
          </div>
        </div>
      </div>

      {/* Queue Metric Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-dark-900 border border-white/5 space-y-0.5">
          <div className="text-slate-400 text-[11px]">Total Jobs Logged</div>
          <div className="text-base font-bold text-white">{queueStatus?.totalJobs || 0}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-dark-900 border border-white/5 space-y-0.5">
          <div className="text-slate-400 text-[11px]">Active / Processing</div>
          <div className="text-base font-bold text-brand-400">{queueStatus?.processing || 0}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-dark-900 border border-white/5 space-y-0.5">
          <div className="text-slate-400 text-[11px]">Completed & Ready</div>
          <div className="text-base font-bold text-emerald-400">{queueStatus?.ready || 0}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-dark-900 border border-white/5 space-y-0.5">
          <div className="text-slate-400 text-[11px]">Failed / Retried</div>
          <div className="text-base font-bold text-rose-400">{queueStatus?.failed || 0}</div>
        </div>
      </div>

      {/* Jobs Stream */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Recent Background Jobs Stream
        </div>

        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
          {queueStatus?.jobs?.map((job) => {
            const isReady = job.status === 'READY';
            const isFailed = job.status === 'FAILED';

            return (
              <div
                key={job.id}
                className="p-3.5 rounded-xl bg-dark-900/80 border border-white/5 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white font-mono text-[11px]">
                    {job.jobType}
                  </span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                    isReady
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      : isFailed
                      ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                      : 'bg-brand-500/10 text-brand-300 border-brand-500/30'
                  }`}>
                    {job.status} ({job.progress}%)
                  </span>
                </div>

                <ProgressBar value={job.progress} colorScheme={isReady ? 'emerald' : 'brand'} height="h-1" />

                {job.logs && job.logs.length > 0 && (
                  <div className="text-[10px] text-slate-400 font-mono line-clamp-1">
                    ↳ {job.logs[job.logs.length - 1]}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
