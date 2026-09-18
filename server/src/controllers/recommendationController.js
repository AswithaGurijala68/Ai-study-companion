const db = require('../db/database');
const recommendationEngine = require('../services/recommendationEngine');

exports.getProjectRecommendations = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const recs = await recommendationEngine.generateProjectRecommendations({
      projectId,
      userId: req.user.id
    });
    res.json({ recommendations: recs });
  } catch (err) {
    next(err);
  }
};

exports.getGlobalRecommendations = (req, res) => {
  const recs = recommendationEngine.getGlobalRecommendations(req.user.id);
  res.json({ recommendations: recs });
};

exports.dismissRecommendation = (req, res) => {
  const { id } = req.params;
  const updated = db.update('recommendations', id, { isDismissed: true });
  res.json({ success: true, recommendation: updated });
};
