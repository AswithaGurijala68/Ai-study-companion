const db = require('../db/database');
const assessmentService = require('../services/assessmentService');

exports.startAdaptiveQuiz = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { conceptId, questionCount } = req.body;
    const userId = req.user.id;

    const result = await assessmentService.generateAdaptiveQuiz({
      projectId,
      userId,
      targetConceptId: conceptId || null,
      questionCount: Number(questionCount) || 3
    });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getQuiz = (req, res) => {
  const { id } = req.params;
  const quiz = db.findById('quizzes', id);
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

  const questions = db.find('quiz_questions', q => q.quizId === id);
  res.json({ quiz, questions });
};

exports.submitAnswer = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const { answer } = req.body;
    const userId = req.user.id;

    if (answer === undefined || answer === null) {
      return res.status(400).json({ error: 'Answer is required' });
    }

    const updatedQuestion = await assessmentService.submitQuestionAnswer({
      questionId,
      userId,
      userAnswer: answer
    });

    res.json({ question: updatedQuestion });
  } catch (err) {
    next(err);
  }
};

exports.completeQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const completedQuiz = await assessmentService.finalizeQuiz({
      quizId: id,
      userId
    });

    const questions = db.find('quiz_questions', q => q.quizId === id);
    res.json({ quiz: completedQuiz, questions });
  } catch (err) {
    next(err);
  }
};

exports.listProjectQuizzes = (req, res) => {
  const { projectId } = req.params;
  const quizzes = db.find('quizzes', q => q.projectId === projectId && q.userId === req.user.id);
  res.json({ quizzes });
};
