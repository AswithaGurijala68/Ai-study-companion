import React, { useState, useEffect } from 'react';
import { Settings, Key, Cpu, ShieldCheck, Database, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function SettingsPage() {
  const [config, setConfig] = useState({ hasApiKey: false, preferredModel: 'gemini-1.5-flash' });
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-flash');
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    try {
      const res = await api.getAIConfig();
      setConfig(res);
      setSelectedModel(res.preferredModel || 'gemini-1.5-flash');
    } catch (err) {
      console.error('Failed to load AI config:', err);
    }
  }

  async function handleSaveConfig(e) {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.saveAIConfig({
        apiKey: apiKeyInput ? apiKeyInput.trim() : undefined,
        preferredModel: selectedModel
      });

      setConfig(res);
      setApiKeyInput('');
      addToast({
        title: 'Settings Saved',
        message: 'AI Model configuration updated successfully.',
        type: 'success'
      });
    } catch (err) {
      addToast({ title: 'Save Failed', message: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-brand-400 uppercase tracking-wider">
          <Settings className="w-4 h-4" />
          <span>System Configuration</span>
        </div>
        <h1 className="text-2xl font-bold text-white mt-1">Workspace Settings</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Configure AI reasoning engines, custom API keys, and model preferences.
        </p>
      </div>

      {/* AI Engine Configuration Card */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">AI Provider & Model Engine</h3>
              <p className="text-xs text-slate-400">Works 100% out-of-the-box with built-in engine or your custom Gemini API key.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{config.hasApiKey ? 'Live Gemini Key Active' : 'Built-in Engine Active'}</span>
          </div>
        </div>

        <form onSubmit={handleSaveConfig} className="space-y-5">
          {/* Model Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Preferred Model Architecture
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', badge: 'Fast & Low Cost', desc: 'Optimal for real-time tutoring and quiz generation.' },
                { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', badge: 'High Reasoning', desc: 'Extended context reasoning for complex document synthesis.' },
                { id: 'built-in-local-engine', name: 'Built-in Local Engine', badge: 'Zero Setup', desc: 'Deterministic grounded reasoning without external API calls.' }
              ].map(m => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  className={`p-4 rounded-xl border text-left space-y-2 transition ${
                    selectedModel === m.id
                      ? 'bg-brand-600/20 border-brand-500 text-white shadow-lg shadow-brand-500/10'
                      : 'bg-dark-900 border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{m.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-dark-800 text-brand-300 border border-brand-500/20 font-semibold">
                      {m.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Gemini API Key Entry */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Google Gemini API Key (Optional)
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder={config.hasApiKey ? '•••••••••••••••••••• (Active)' : 'Enter your GEMINI_API_KEY...'}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              If left blank, the application automatically uses the Built-in Engine with instant grounded responses and grading.
            </p>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition disabled:opacity-50 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
