import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Award, 
  ArrowRight, 
  RotateCcw, 
  FileText, 
  Target,
  Brain,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { api } from '../../services/api';
import ProgressBar from '../common/ProgressBar';
import { useToast } from '../../context/ToastContext';

export default function AdaptiveQuizView({ projectId, concepts = [], onMasteryUpdated }) {
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedMCQ, setSelectedMCQ] = useState(null);
  const [openEndedText, setOpenEndedText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [targetConceptId, setTargetConceptId] = useState('');
  const [quizFinished, setQuizFinished] = useState(false);
  const { addToast } = useToast();

  async function handleStartQuiz() {
    try {
      setGenerating(true);
      const res = await api.startAdaptiveQuiz(projectId, {
        conceptId: targetConceptId || null,
        questionCount: 3
      });
      setActiveQuiz(res.quiz);
      setQuestions(res.questions || []);
      setCurrentQuestionIdx(0);
      setSelectedMCQ(null);
      setOpenEndedText('');
      setQuizFinished(false);

      addToast({
        title: 'Adaptive Quiz Ready',
        message: 'Questions generated targeting your active mastery level.',
        type: 'success'
      });
    } catch (err) {
      addToast({
        title: 'Quiz Generation Failed',
        message: err.message,
        type: 'error'
      });
    } finally {
      setGenerating(false);
    }
  }

  async function handleSubmitAnswer() {
    const currentQ = questions[currentQuestionIdx];
    if (!currentQ) return;

    const answer = currentQ.type === 'multiple_choice' ? selectedMCQ : openEndedText;
    if (answer === null || answer === undefined || (typeof answer === 'string' && !answer.trim())) {
      addToast({ title: 'Answer Required', message: 'Please provide an answer before submitting.', type: 'warning' });
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.submitAnswer(currentQ.id, answer);

      // Update question state in local array
      const updatedQuestions = [...questions];
      updatedQuestions[currentQuestionIdx] = res.question;
      setQuestions(updatedQuestions);

      if (onMasteryUpdated) onMasteryUpdated();

      addToast({
        title: 'Answer Evaluated',
        message: 'Mastery score updated with learning evidence.',
        type: 'info'
      });
    } catch (err) {
      addToast({
        title: 'Submission Error',
        message: err.message,
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCompleteQuiz() {
    if (!activeQuiz) return;
    try {
      setSubmitting(true);
      const res = await api.completeQuiz(activeQuiz.id);
      setActiveQuiz(res.quiz);
      setQuizFinished(true);

      if (onMasteryUpdated) onMasteryUpdated();

      addToast({
        title: 'Assessment Completed!',
        message: `Final Score: ${res.quiz.score}%. Recommendations updated.`,
        type: 'success'
      });
    } catch (err) {
      addToast({
        title: 'Error Finalizing Quiz',
        message: err.message,
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  }

  const currentQ = questions[currentQuestionIdx];
  const isAnswered = currentQ && (currentQ.userAnswer !== null && currentQ.userAnswer !== undefined);

  // If no quiz started or finished
  if (!activeQuiz || quizFinished) {
    return (
      <div className="glass-card rounded-2xl p-8 border border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-brand-400" />
              <span>Adaptive Quiz & Psychometric Assessment</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
              Dynamically generates Multiple Choice and Open-Ended questions calibrated to your lowest mastery areas. AI analyzes conceptual understanding rather than just grading keywords.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={targetConceptId}
              onChange={(e) => setTargetConceptId(e.target.value)}
              className="px-3 py-2 rounded-xl bg-dark-900 border border-white/10 text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="">Target Weakest Concepts (Auto)</option>
              {concepts.map(c => (
                <option key={c.conceptId || c.id} value={c.conceptId || c.id}>
                  {c.name} ({c.score}%)
                </option>
              ))}
            </select>

            <button
              onClick={handleStartQuiz}
              disabled={generating}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg shadow-brand-600/30 transition disabled:opacity-50 flex items-center gap-2"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Calibrating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Start Assessment</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Screen after completing */}
        {quizFinished && activeQuiz && (
          <div className="p-6 rounded-2xl bg-gradient-to-tr from-brand-950/40 to-dark-900 border border-brand-500/30 text-center space-y-4 animate-slide-up">
            <div className="w-14 h-14 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 mx-auto">
              <Award className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white">Assessment Complete!</h4>
              <p className="text-xs text-slate-400 mt-1">
                Your performance has been incorporated into your Concept Mastery distribution.
              </p>
            </div>

            <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
              {activeQuiz.score}%
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={handleStartQuiz}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Take Another Adaptive Quiz</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6">
      {/* Quiz Header & Stepper */}
      <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
            Question {currentQuestionIdx + 1} of {questions.length}
          </span>
          <h3 className="text-sm font-bold text-white mt-1.5">
            {activeQuiz.title}
          </h3>
        </div>

        <div className="w-36">
          <ProgressBar value={currentQuestionIdx + 1} max={questions.length} height="h-2" colorScheme="brand" />
        </div>
      </div>

      {/* Active Question Card */}
      {currentQ && (
        <div className="space-y-6">
          {/* Target Concept & Difficulty Tag */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Concept:</span>
              <span className="font-bold text-brand-300">{currentQ.conceptName}</span>
            </div>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
              currentQ.difficulty === 'hard'
                ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                : currentQ.difficulty === 'medium'
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
            }`}>
              {currentQ.difficulty} difficulty
            </span>
          </div>

          {/* Prompt */}
          <div className="text-sm sm:text-base font-medium text-white leading-relaxed p-4 rounded-xl bg-dark-900 border border-white/5">
            {currentQ.prompt}
          </div>

          {/* Question Inputs */}
          {currentQ.type === 'multiple_choice' ? (
            /* MCQ Options */
            <div className="space-y-2.5">
              {currentQ.options?.map((option, optIdx) => {
                const isSelected = selectedMCQ === optIdx || currentQ.userAnswer === optIdx;
                let optionStyle = 'bg-dark-900 border-white/10 hover:border-white/20 text-slate-200';

                if (isAnswered) {
                  if (optIdx === currentQ.correctAnswer) {
                    optionStyle = 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200 font-semibold';
                  } else if (isSelected && !currentQ.isCorrect) {
                    optionStyle = 'bg-rose-950/40 border-rose-500/50 text-rose-200';
                  }
                } else if (isSelected) {
                  optionStyle = 'bg-brand-600/20 border-brand-500 text-brand-200 font-semibold shadow';
                }

                return (
                  <button
                    key={optIdx}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => setSelectedMCQ(optIdx)}
                    className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm flex items-start gap-3 transition ${optionStyle}`}
                  >
                    <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="flex-1">{option}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Open-Ended Textarea */
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-400">
                Your Answer (Explain in your own words):
              </label>
              <textarea
                rows={4}
                disabled={isAnswered}
                value={isAnswered ? currentQ.userAnswer : openEndedText}
                onChange={(e) => setOpenEndedText(e.target.value)}
                placeholder="Write your explanation here..."
                className="w-full p-4 rounded-xl bg-dark-900 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-brand-500 transition resize-none disabled:opacity-80"
              />
            </div>
          )}

          {/* AI Rubric Evaluation Card (Displayed after submission) */}
          {isAnswered && (
            <div className="p-5 rounded-xl bg-dark-900/90 border border-brand-500/30 space-y-4 animate-slide-up">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  {currentQ.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  )}
                  <span className="text-sm font-bold text-white">
                    {currentQ.type === 'multiple_choice'
                      ? (currentQ.isCorrect ? 'Correct Answer' : 'Incorrect')
                      : `AI Rubric Score: ${currentQ.aiEvaluation?.score || 80}%`}
                  </span>
                </div>

                <span className="text-xs text-brand-400 font-semibold">
                  Mastery Updated
                </span>
              </div>

              {currentQ.type === 'multiple_choice' ? (
                <p className="text-xs text-slate-300 leading-relaxed">
                  <span className="font-semibold text-slate-200">Explanation: </span>
                  {currentQ.explanation}
                </p>
              ) : currentQ.aiEvaluation && (
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="font-semibold text-slate-200">Understanding Assessment: </span>
                    <span className="text-slate-300">{currentQ.aiEvaluation.understanding}</span>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-200">Accuracy Analysis: </span>
                    <span className="text-slate-300">{currentQ.aiEvaluation.accuracy}</span>
                  </div>

                  {currentQ.aiEvaluation.keyConceptsCovered?.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-emerald-400">Covered:</span>
                      {currentQ.aiEvaluation.keyConceptsCovered.map((c, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px]">
                          ✓ {c}
                        </span>
                      ))}
                    </div>
                  )}

                  {currentQ.aiEvaluation.missingConcepts?.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-amber-400">Missing Elements:</span>
                      {currentQ.aiEvaluation.missingConcepts.map((m, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px]">
                          • {m}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div>
              {currentQuestionIdx > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentQuestionIdx(idx => idx - 1);
                    setSelectedMCQ(null);
                    setOpenEndedText('');
                  }}
                  className="text-xs text-slate-400 hover:text-white transition"
                >
                  Previous Question
                </button>
              )}
            </div>

            <div>
              {!isAnswered ? (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmitAnswer}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Grading Answer...</span>
                    </>
                  ) : (
                    <span>Submit & Evaluate</span>
                  )}
                </button>
              ) : currentQuestionIdx < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentQuestionIdx(idx => idx + 1);
                    setSelectedMCQ(null);
                    setOpenEndedText('');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition flex items-center gap-1.5"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleCompleteQuiz}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition flex items-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  <span>Finalize Assessment</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
