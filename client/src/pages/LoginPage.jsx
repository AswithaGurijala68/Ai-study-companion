import React, { useState } from 'react';
import { BookOpen, Lock, Mail, UserPlus, LogIn, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      if (mode === 'login') await login(email, password);
      else await register(name, email, password);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center mb-4">
            <Sparkles className="w-7 h-7 text-brand-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">StudyFlow AI</h1>
          <p className="text-sm text-slate-400 mt-2">Persistent, contextual, measurable learning.</p>
        </div>
        <div className="glass-card rounded-2xl border border-white/10 p-6">
          <div className="flex gap-2 mb-6 bg-dark-800 rounded-xl p-1">
            <button onClick={() => setMode('login')} className={`flex-1 py-2 rounded-lg text-sm ${mode === 'login' ? 'bg-brand-600 text-white' : 'text-slate-400'}`}>Sign in</button>
            <button onClick={() => setMode('register')} className={`flex-1 py-2 rounded-lg text-sm ${mode === 'register' ? 'bg-brand-600 text-white' : 'text-slate-400'}`}>Create account</button>
          </div>
          <form onSubmit={submit} className="space-y-4">
            {mode === 'register' && <label className="block"><span className="text-xs text-slate-400">Name</span><div className="relative mt-1"><UserPlus className="absolute left-3 top-3.5 w-4 h-4 text-slate-500"/><input value={name} onChange={e=>setName(e.target.value)} className="w-full bg-dark-900 border border-white/10 rounded-xl pl-10 pr-3 py-3 text-sm outline-none focus:border-brand-500" placeholder="Your name"/></div></label>}
            <label className="block"><span className="text-xs text-slate-400">Email</span><div className="relative mt-1"><Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-500"/><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-dark-900 border border-white/10 rounded-xl pl-10 pr-3 py-3 text-sm outline-none focus:border-brand-500" placeholder="you@example.com"/></div></label>
            <label className="block"><span className="text-xs text-slate-400">Password</span><div className="relative mt-1"><Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-500"/><input type="password" required value={password} onChange={e=>setPassword(e.target.value)} className="w-full bg-dark-900 border border-white/10 rounded-xl pl-10 pr-3 py-3 text-sm outline-none focus:border-brand-500" placeholder="At least 6 characters"/></div></label>
            {error && <div className="rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs p-3">{error}</div>}
            <button disabled={busy} className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 font-semibold text-sm flex items-center justify-center gap-2">{mode === 'login' ? <LogIn className="w-4 h-4"/> : <BookOpen className="w-4 h-4"/>}{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
          </form>
          {mode === 'login' && <div className="mt-5 text-[11px] text-slate-500 border-t border-white/5 pt-4">Demo student: alex.chen@learn.ai / study123<br/>Demo admin: admin@system.ai / admin123</div>}
        </div>
      </div>
    </div>
  );
}
