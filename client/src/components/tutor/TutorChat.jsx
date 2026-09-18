import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Sparkles, 
  Bookmark, 
  AlertTriangle, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Cpu, 
  CheckCircle2, 
  Target, 
  HelpCircle,
  Clock,
  Zap,
  Loader2,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { api } from '../../services/api';
import CitationDrawer from './CitationDrawer';
import { useToast } from '../../context/ToastContext';

const QUICK_PROMPTS = [
  'Why is the dot product scaled by sqrt(d_k)?',
  'How does Rotary Positional Embedding (RoPE) preserve relative distance?',
  'Explain the memory savings of KV Cache during token decoding.',
  'What happens if we remove layer normalization from attention?'
];

export default function TutorChat({ projectId, projectGoal, onOpenReader }) {
  const [messages, setMessages] = useState([]);
  const [learnerContext, setLearnerContext] = useState(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGeneralMode, setIsGeneralMode] = useState(false);
  const messagesEndRef = useRef(null);
  const { addToast } = useToast();

  useEffect(() => {
    if (projectId) {
      loadConversation();
    }
  }, [projectId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function loadConversation() {
    try {
      const res = await api.getConversation(projectId);
      setMessages(res.messages || []);
      setLearnerContext(res.learnerContext || null);
    } catch (err) {
      console.error('Failed to load conversation:', err);
    }
  }

  async function handleSend(textToSend = null, allowGeneral = null) {
    const text = textToSend !== null ? textToSend : inputText;
    if (!text || !text.trim() || loading) return;

    const trimmed = text.trim();
    if (textToSend === null) setInputText('');

    const useGeneral = allowGeneral !== null ? allowGeneral : isGeneralMode;

    // Optimistic UI for user message
    const tempUserMsg = {
      id: 'temp-' + Date.now(),
      sender: 'user',
      content: trimmed,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await api.sendTutorMessage(projectId, {
        message: trimmed,
        allowGeneralKnowledge: useGeneral
      });

      setMessages(prev => [...prev.filter(m => m.id !== tempUserMsg.id), res.userMessage, res.assistantMessage]);
    } catch (err) {
      addToast({
        title: 'Tutor Error',
        message: err.message,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleClearChat() {
    try {
      await api.clearConversation(projectId);
      setMessages([]);
      addToast({ title: 'Chat Cleared', message: 'Conversation history wiped for this project.', type: 'info' });
    } catch (err) {
      console.error(err);
    }
  }

  function speakText(text) {
    if (!window.speechSynthesis) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const cleanText = text.replace(/\[Source:.*?\]/g, '').replace(/[*#`_]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className="flex flex-col h-[75vh] glass-card rounded-2xl overflow-hidden border border-white/10 relative">
      {/* Persistent Learner Context Bar */}
      <div className="px-5 py-3 border-b border-white/5 bg-dark-900/90 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Goal Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20 font-medium">
            <Target className="w-3.5 h-3.5 text-brand-400" />
            <span className="truncate max-w-xs">{learnerContext?.learningGoal || projectGoal || 'Active Project'}</span>
          </div>

          {/* Weakness Pill */}
          {learnerContext?.weakConcepts?.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 font-medium">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              <span>Weakness: {learnerContext.weakConcepts[0]}</span>
            </div>
          )}

          {/* Strength Pill */}
          {learnerContext?.strongConcepts?.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Mastered: {learnerContext.strongConcepts[0]}</span>
            </div>
          )}
        </div>

        {/* Mode Selector & Clear Chat */}
        <div className="flex items-center gap-2">
          {/* Grounded vs General AI Mode Toggle */}
          <button
            type="button"
            onClick={() => {
              setIsGeneralMode(!isGeneralMode);
              addToast({
                title: !isGeneralMode ? 'General AI Mode Enabled' : 'Grounded Materials Mode Active',
                message: !isGeneralMode 
                  ? 'Tutor will explain any topic using broad AI knowledge.' 
                  : 'Tutor will ground answers strictly in uploaded project documents.',
                type: 'info'
              });
            }}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 transition ${
              isGeneralMode
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow'
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
            }`}
            title="Toggle between Grounded Materials mode and General AI Knowledge mode"
          >
            {isGeneralMode ? (
              <>
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>General AI Mode</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Grounded Materials</span>
              </>
            )}
          </button>

          <button
            onClick={handleClearChat}
            className="text-slate-400 hover:text-white text-[11px] flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/5 transition"
            title="Reset conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 font-sans">
        {messages.length === 0 && (
          <div className="text-center py-12 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400 mx-auto">
              <Sparkles className="w-6 h-6 animate-pulse-subtle" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Grounded AI Tutor Ready</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                Ask any question about your project. Every answer is grounded in your uploaded materials with exact page citations.
              </p>
            </div>

            {/* Quick Prompt Chips */}
            <div className="pt-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Suggested Topics to Explore
              </div>
              <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    className="text-xs px-3 py-1.5 rounded-xl bg-dark-800 hover:bg-dark-700 border border-white/5 hover:border-brand-500/40 text-slate-300 hover:text-white transition text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isUser = msg.sender === 'user';
          // Find the last user question for refusal fallback button
          const prevUserMsg = !isUser && idx > 0 ? messages[idx - 1] : null;

          return (
            <div
              key={msg.id || idx}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex-shrink-0 flex items-center justify-center text-white shadow-md shadow-brand-500/20 mt-1">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-2xl rounded-2xl p-4 space-y-3 ${
                isUser 
                  ? 'bg-brand-600 text-white rounded-tr-sm shadow-md shadow-brand-600/20' 
                  : 'bg-dark-900/90 border border-white/10 text-slate-100 rounded-tl-sm'
              }`}>
                {/* Message Body */}
                <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </div>

                {/* Unsupported Question Refusal Alert */}
                {msg.insufficientEvidence && (
                  <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs space-y-2.5">
                    <div className="font-semibold flex items-center gap-1.5 text-amber-300">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>Strict Grounding Boundary</span>
                    </div>
                    <p className="text-[11px] text-amber-200/90 leading-relaxed">
                      This question is outside the evidence available in your uploaded project notes. The Tutor will not fabricate facts.
                    </p>
                    <button
                      onClick={() => {
                        setIsGeneralMode(true);
                        handleSend(prevUserMsg ? prevUserMsg.content : 'Explain this topic in detail', true);
                      }}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500 hover:text-dark-900 transition flex items-center gap-1.5 shadow"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Explain using General AI Knowledge</span>
                    </button>
                  </div>
                )}

                {/* Grounded Citation Badges */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="pt-2 border-t border-white/5 space-y-1.5">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Bookmark className="w-3 h-3 text-brand-400" />
                      <span>Verified Sources</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {msg.citations.map((cite, cIdx) => (
                        <button
                          key={cIdx}
                          onClick={() => setSelectedCitation(cite)}
                          className="px-2.5 py-1 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 border border-brand-500/20 hover:border-brand-500/40 text-xs font-medium transition flex items-center gap-1.5 group"
                        >
                          <Bookmark className="w-3 h-3 text-brand-400 group-hover:scale-110 transition" />
                          <span>{cite.materialTitle} — Page {cite.pageNumber}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Telemetry pill & Text-to-speech for Assistant */}
                {!isUser && (
                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500 border-t border-white/5">
                    <div className="flex items-center gap-3">
                      {msg.latencyMs && <span>⚡ {msg.latencyMs}ms</span>}
                      {msg.tokenUsage?.total && <span>📊 {msg.tokenUsage.total} tokens</span>}
                      {msg.isGrounded && <span className="text-emerald-400 font-semibold">✓ Grounded</span>}
                      {msg.isGeneralKnowledge && <span className="text-amber-400 font-semibold">💡 General AI</span>}
                    </div>

                    <button
                      onClick={() => speakText(msg.content)}
                      className="hover:text-white transition flex items-center gap-1"
                      title="Read aloud"
                    >
                      {isSpeaking ? <VolumeX className="w-3 h-3 text-rose-400" /> : <Volume2 className="w-3 h-3" />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-dark-900 border border-white/10 text-slate-300 text-xs flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
              <span>Retrieving project context & composing grounded response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 border-t border-white/10 bg-dark-900/90">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isGeneralMode ? "Ask AI Tutor anything (General AI Mode Active)..." : "Ask AI Tutor anything about your project materials..."}
            className="flex-1 px-4 py-2.5 rounded-xl bg-dark-800 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-brand-500 transition"
          />

          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white disabled:opacity-40 transition shadow-lg shadow-brand-600/30 flex items-center gap-1.5 text-xs font-semibold"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>

      {/* Citation Inspector Drawer */}
      <CitationDrawer
        isOpen={!!selectedCitation}
        onClose={() => setSelectedCitation(null)}
        citation={selectedCitation}
        onOpenInReader={onOpenReader}
      />
    </div>
  );
}
