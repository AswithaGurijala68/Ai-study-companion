import React, { useState } from 'react';
import { Cpu, Search, CheckCircle2, XCircle, Clock, DollarSign, Eye, X, Filter } from 'lucide-react';
import Modal from '../common/Modal';

export default function TelemetryLogTable({ logs = [], onRefresh }) {
  const [featureFilter, setFeatureFilter] = useState('');
  const [modelFilter, setModelFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  const filtered = logs.filter(log => {
    if (featureFilter && log.feature !== featureFilter) return false;
    if (modelFilter && !log.model?.toLowerCase().includes(modelFilter.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-brand-400" />
            <span>AI Telemetry & Observability Traces</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time inference logs, latency metrics, token breakdowns, and grounding verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Feature Filter */}
          <select
            value={featureFilter}
            onChange={(e) => setFeatureFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-dark-900 border border-white/10 text-xs text-white focus:outline-none"
          >
            <option value="">All Features</option>
            <option value="tutor_chat">Tutor Chat</option>
            <option value="assessment_grading">Assessment Grading</option>
            <option value="adaptive_question_gen">Adaptive Question Gen</option>
            <option value="tutor_unsupported_refusal">Unsupported Refusal</option>
          </select>

          {/* Model Filter */}
          <select
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-dark-900 border border-white/10 text-xs text-white focus:outline-none"
          >
            <option value="">All Models</option>
            <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
            <option value="built-in-local-engine">Local Engine</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/5 bg-dark-900/60">
        <table className="w-full text-left text-xs">
          <thead className="bg-dark-900 text-slate-400 uppercase font-semibold text-[10px] border-b border-white/5">
            <tr>
              <th className="py-3 px-4">Feature / Action</th>
              <th className="py-3 px-4">Model</th>
              <th className="py-3 px-4">Latency</th>
              <th className="py-3 px-4">Tokens (In / Out)</th>
              <th className="py-3 px-4">Est. Cost</th>
              <th className="py-3 px-4">Grounding</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-300">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-slate-500">
                  No telemetry traces logged for current filter.
                </td>
              </tr>
            ) : (
              filtered.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition">
                  <td className="py-3 px-4 font-medium text-white capitalize">
                    {log.feature?.replace(/_/g, ' ')}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-dark-800 border border-white/10 font-mono text-[11px] text-brand-300">
                      {log.model}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-mono ${log.latencyMs > 800 ? 'text-amber-400' : 'text-slate-300'}`}>
                      {log.latencyMs} ms
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span className="text-slate-400">{log.promptTokens}</span> / <span className="text-slate-200">{log.completionTokens}</span>
                    <span className="text-slate-500 text-[10px] ml-1">({log.totalTokens})</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-emerald-400">
                    ${Number(log.estimatedCost || 0).toFixed(6)}
                  </td>
                  <td className="py-3 px-4">
                    {log.isGrounded ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-bold">
                        Grounded
                      </span>
                    ) : log.insufficientEvidence ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-bold">
                        Refusal Handled
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[10px]">General</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {log.status === 'SUCCESS' ? (
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> OK
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-400 font-semibold text-[11px]">
                        <XCircle className="w-3.5 h-3.5" /> Fail
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="p-1.5 rounded-lg bg-dark-800 hover:bg-brand-600 text-slate-400 hover:text-white transition"
                      title="Inspect trace payload"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Log Detail Inspector Modal */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={`AI Inference Trace: ${selectedLog.id}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-dark-900 border border-white/5">
              <div>
                <span className="text-slate-500 block">Feature</span>
                <span className="font-semibold text-white capitalize">{selectedLog.feature}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Model</span>
                <span className="font-semibold text-brand-300 font-mono">{selectedLog.model}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Latency</span>
                <span className="font-semibold text-white">{selectedLog.latencyMs} ms</span>
              </div>
              <div>
                <span className="text-slate-500 block">Est. Cost</span>
                <span className="font-semibold text-emerald-400">${selectedLog.estimatedCost}</span>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Prompt Preview</label>
              <div className="p-3 rounded-xl bg-dark-900 border border-white/5 text-slate-300 font-mono text-[11px] whitespace-pre-wrap max-h-48 overflow-y-auto">
                {selectedLog.promptPreview || 'No preview captured.'}
              </div>
            </div>

            {selectedLog.errorMessage && (
              <div>
                <label className="font-semibold text-rose-400 block mb-1">Error Trace</label>
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 font-mono text-[11px]">
                  {selectedLog.errorMessage}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
