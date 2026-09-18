import React, { useState } from 'react';
import { Award, CheckCircle2, XCircle, Play, Sparkles, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import ProgressBar from '../common/ProgressBar';
import { useToast } from '../../context/ToastContext';

export default function AIEvalBenchmarkView({ evaluations = [], onEvaluated }) {
  const [running, setRunning] = useState(false);
  const { addToast } = useToast();

  async function handleRunBenchmarks() {
    try {
      setRunning(true);
      const res = await api.runBenchmarks();
      addToast({
        title: 'Benchmarks Completed',
        message: 'All AI regression test suites executed and recorded.',
        type: 'success'
      });
      if (onEvaluated) onEvaluated();
    } catch (err) {
      addToast({
        title: 'Benchmark Run Failed',
        message: err.message,
        type: 'error'
      });
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>AI Evaluation Benchmark Suite</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated regression testing for Groundedness, Citation Accuracy, Unsupported Question Handling, and AI Grading Quality.
          </p>
        </div>

        <button
          onClick={handleRunBenchmarks}
          disabled={running}
          className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition disabled:opacity-50 flex items-center gap-2"
        >
          {running ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Running Suites...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Run Automated Benchmarks</span>
            </>
          )}
        </button>
      </div>

      {/* Benchmark Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {evaluations.slice(0, 3).map((evalItem) => {
          const isPassed = evalItem.status === 'PASSED';
          return (
            <div
              key={evalItem.id}
              className="p-5 rounded-2xl bg-dark-900 border border-white/5 space-y-3 relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-white leading-tight line-clamp-2">
                    {evalItem.benchmarkName}
                  </h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                    isPassed
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                  }`}>
                    {evalItem.status}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed line-clamp-2">
                  {evalItem.details}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Accuracy Rate</span>
                  <span className={`font-bold ${evalItem.accuracyRate >= 85 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {evalItem.accuracyRate}%
                  </span>
                </div>

                <ProgressBar value={evalItem.accuracyRate} colorScheme="emerald" height="h-1.5" />

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <span>{evalItem.passedCount}/{evalItem.testCaseCount} tests passed</span>
                  <span>⚡ {evalItem.meanLatencyMs} ms</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
