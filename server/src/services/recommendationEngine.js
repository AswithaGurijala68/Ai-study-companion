const db = require('../db/database');
const eventBus = require('./eventBus');

class RecommendationEngine {
  async generateProjectRecommendations({ projectId, userId }) {
    const project = db.findById('projects', projectId);
    if (!project) return [];

    const masteryList = db.find('concept_mastery', m => m.projectId === projectId && m.userId === userId);
    const materials = db.find('materials', m => m.projectId === projectId && m.status === 'READY');
    const weakConcepts = masteryList.filter(m => m.status === 'Requiring Attention' || m.score < 60);

    const generatedRecs = [];

    // 1. Weak Concept Recommendation
    if (weakConcepts.length > 0) {
      const weakest = weakConcepts.sort((a, b) => a.score - b.score)[0];
      const matchingChunk = db.findOne('document_chunks', c => c.projectId === projectId && (c.concepts.includes(weakest.conceptName) || c.content.includes(weakest.conceptName)));
      const pageRef = matchingChunk ? `Page ${matchingChunk.pageNumber}` : 'the primary study guide';

      generatedRecs.push({
        userId,
        projectId,
        type: 'practice_weakness',
        title: `Targeted Practice: ${weakest.conceptName}`,
        description: `Your mastery for "${weakest.conceptName}" is at ${weakest.score}% (Requiring Attention). Review ${pageRef} and take a 3-question adaptive quiz to strengthen retention.`,
        actionType: 'start_quiz',
        actionPayload: { conceptId: weakest.conceptId, conceptName: weakest.conceptName },
        priority: 'high',
        isDismissed: false
      });
    }

    // 2. Material Exploration Recommendation
    if (materials.length > 0) {
      const firstMat = materials[0];
      generatedRecs.push({
        userId,
        projectId,
        type: 'explore_material',
        title: `Deepen Understanding with AI Tutor`,
        description: `Ask the AI Tutor to synthesize the key equations and architectural tradeoffs from "${firstMat.title}".`,
        actionType: 'open_tutor',
        actionPayload: { suggestedPrompt: `Can you explain the main theoretical tradeoffs highlighted in ${firstMat.title}?` },
        priority: 'medium',
        isDismissed: false
      });
    }

    // Save and emit events for new recommendations
    for (const rec of generatedRecs) {
      const existing = db.findOne('recommendations', r => 
        r.projectId === projectId && r.userId === userId && r.title === rec.title && !r.isDismissed
      );
      if (!existing) {
        db.insert('recommendations', rec);
        eventBus.emitEvent({
          userId,
          projectId,
          type: 'RECOMMENDATION_GENERATED',
          title: 'Next Step Recommendation',
          details: rec.title
        });
      }
    }

    return db.find('recommendations', r => r.projectId === projectId && r.userId === userId && !r.isDismissed);
  }

  getGlobalRecommendations(userId) {
    return db.find('recommendations', r => r.userId === userId && !r.isDismissed);
  }
}

const recommendationEngine = new RecommendationEngine();
module.exports = recommendationEngine;
