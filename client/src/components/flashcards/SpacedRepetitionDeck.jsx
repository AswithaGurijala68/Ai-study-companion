import React, { useState, useEffect } from 'react';
import { Layers, RotateCw, CheckCircle2, Sparkles, Clock, ArrowRight, Award } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function SpacedRepetitionDeck({ projectId }) {
  const [flashcards, setFlashcards] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewedCount, setReviewedCount] = useState(0);
  const { addToast } = useToast();

  useEffect(() => {
    if (projectId) loadFlashcards();
  }, [projectId]);

  async function loadFlashcards() {
    try {
      setLoading(true);
      const res = await api.getFlashcards(projectId);
      setFlashcards(res.flashcards || []);
      setCurrentIdx(0);
      setIsFlipped(false);
      setReviewedCount(0);
    } catch (err) {
      console.error('Failed to load flashcards:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRate(rating) {
    const card = flashcards[currentIdx];
    if (!card) return;

    try {
      await api.reviewFlashcard(card.id, rating);
      setReviewedCount(c => c + 1);
      setIsFlipped(false);

      if (currentIdx < flashcards.length - 1) {
        setCurrentIdx(idx => idx + 1);
      } else {
        addToast({
          title: 'Review Session Complete!',
          message: `Reviewed ${flashcards.length} cards with spaced repetition memory scheduling.`,
          type: 'success'
        });
      }
    } catch (err) {
      addToast({ title: 'Rating Failed', message: err.message, type: 'error' });
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-slate-400 text-xs">Loading flashcard deck...</div>;
  }

  if (flashcards.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center space-y-3 border border-white/10">
        <Layers className="w-8 h-8 text-slate-500 mx-auto" />
        <h4 className="text-sm font-bold text-white">No Flashcards Yet</h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Flashcards are generated automatically as you upload materials and explore concepts with the AI Tutor.
        </p>
      </div>
    );
  }

  const isCompleted = reviewedCount >= flashcards.length;
  const currentCard = flashcards[currentIdx];

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6 max-w-3xl mx-auto">
      {/* Deck Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-brand-400" />
          <h3 className="text-base font-bold text-white">Spaced Repetition Active Recall (SM-2)</h3>
        </div>
        <span className="text-xs font-semibold text-slate-400">
          Card {currentIdx + 1} of {flashcards.length}
        </span>
      </div>

      {!isCompleted ? (
        <div className="space-y-6">
          {/* Flip Flashcard Card */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="min-h-[220px] rounded-2xl p-8 bg-gradient-to-tr from-dark-900 via-dark-800 to-dark-900 border border-brand-500/30 shadow-2xl flex flex-col justify-between cursor-pointer group transition duration-300 hover:border-brand-500/60 relative select-none"
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-brand-300 text-[10px]">
                {isFlipped ? 'Answer Side' : 'Question Prompt'}
              </span>
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <RotateCw className="w-3.5 h-3.5 group-hover:rotate-180 transition duration-500" />
                Click to flip
              </span>
            </div>

            <div className="my-auto py-4 text-center">
              <p className="text-base sm:text-lg font-medium text-white leading-relaxed">
                {isFlipped ? currentCard.back : currentCard.front}
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-white/5">
              <span>Ease: {currentCard.easeFactor || 2.5}</span>
              <span>Interval: {currentCard.interval || 1}d</span>
            </div>
          </div>

          {/* SM-2 Rating Buttons (Visible after flip) */}
          {isFlipped ? (
            <div className="space-y-2 animate-slide-up">
              <div className="text-[11px] font-semibold text-slate-400 text-center uppercase tracking-wider">
                How easily did you recall this concept?
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  onClick={() => handleRate(1)}
                  className="p-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 text-xs font-semibold transition"
                >
                  <div>Again</div>
                  <div className="text-[10px] text-rose-400/80 font-normal">&lt; 1 day</div>
                </button>
                <button
                  onClick={() => handleRate(2)}
                  className="p-3 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/30 text-amber-300 text-xs font-semibold transition"
                >
                  <div>Hard</div>
                  <div className="text-[10px] text-amber-400/80 font-normal">1 day</div>
                </button>
                <button
                  onClick={() => handleRate(3)}
                  className="p-3 rounded-xl bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/30 text-blue-300 text-xs font-semibold transition"
                >
                  <div>Good</div>
                  <div className="text-[10px] text-blue-400/80 font-normal">3 days</div>
                </button>
                <button
                  onClick={() => handleRate(4)}
                  className="p-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition"
                >
                  <div>Easy</div>
                  <div className="text-[10px] text-emerald-400/80 font-normal">6 days</div>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-xs text-slate-400">
              Think of the answer, then click the card to reveal.
            </div>
          )}
        </div>
      ) : (
        /* Completed Review State */
        <div className="text-center py-10 space-y-4 animate-slide-up">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-lg font-bold text-white">All Due Cards Reviewed!</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Your spaced repetition schedule has been updated. Next review will trigger based on your memory retention decay curve.
          </p>
          <button
            onClick={loadFlashcards}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow transition"
          >
            Review Deck Again
          </button>
        </div>
      )}
    </div>
  );
}
