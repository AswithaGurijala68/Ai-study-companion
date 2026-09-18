const db = require('../db/database');
const evaluationService = require('../services/evaluationService');

exports.listEvaluations = (req, res) => {
  const evaluations = db.find('ai_evaluations');
  res.json({ evaluations: evaluations.slice(-20).reverse() });
};

exports.runBenchmarks = async (req, res, next) => {
  try {
    const results = await evaluationService.runAllBenchmarks(req.user.id);
    res.json({
      success: true,
      message: 'AI Benchmark evaluation completed successfully.',
      evaluations: results
    });
  } catch (err) {
    next(err);
  }
};
