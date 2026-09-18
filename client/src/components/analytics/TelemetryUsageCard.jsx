import React from 'react';
import { Cpu, Zap, DollarSign, Clock, BarChart2 } from 'lucide-react';

export default function TelemetryUsageCard({ totalTokens = 0, avgLatencyMs = 0, estimatedCostUSD = 0, totalCalls = 0 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* AI Calls */}
      <div className="p-4 rounded-xl bg-dark-900/80 border border-white/5 space-y-1">
        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
          <Cpu className="w-3.5 h-3.5 text-brand-400" />
          <span>AI Queries</span>
        </div>
        <div className="text-lg font-bold text-white">{totalCalls}</div>
        <div className="text-[10px] text-slate-500">Grounded & graded</div>
      </div>

      {/* Token Count */}
      <div className="p-4 rounded-xl bg-dark-900/80 border border-white/5 space-y-1">
        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
          <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Total Tokens</span>
        </div>
        <div className="text-lg font-bold text-white">{totalTokens.toLocaleString()}</div>
        <div className="text-[10px] text-slate-500">Prompt & completion</div>
      </div>

      {/* Latency */}
      <div className="p-4 rounded-xl bg-dark-900/80 border border-white/5 space-y-1">
        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Avg Latency</span>
        </div>
        <div className="text-lg font-bold text-white">{avgLatencyMs} ms</div>
        <div className="text-[10px] text-slate-500">End-to-end response</div>
      </div>

      {/* Cost */}
      <div className="p-4 rounded-xl bg-dark-900/80 border border-white/5 space-y-1">
        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          <span>Estimated Cost</span>
        </div>
        <div className="text-lg font-bold text-emerald-400">${Number(estimatedCostUSD).toFixed(5)}</div>
        <div className="text-[10px] text-slate-500">Model inference compute</div>
      </div>
    </div>
  );
}
