const db = require('../db/database');
const eventBus = require('./eventBus');
const { MASTERY_WEIGHTS, MASTERY_THRESHOLDS } = require('../config/constants');

class MasteryEngine {
  async recordAssessmentResult({ userId, projectId, conceptId, conceptName, questionType, isCorrect, score }) {
    let masteryRecord = db.findOne('concept_mastery', m => 
      m.projectId === projectId && m.userId === userId && m.conceptId === conceptId
    );

    if (!masteryRecord) {
      masteryRecord = db.insert('concept_mastery', {
        userId,
        projectId,
        conceptId,
        conceptName: conceptName || 'Key Concept',
        score: 50,
        status: 'Stable',
        evidenceCount: 0,
        lastAssessedAt: new Date().toISOString()
      });
    }

    // Determine score adjustment delta
    let delta = 0;
    if (questionType === 'multiple_choice') {
      delta = isCorrect ? MASTERY_WEIGHTS.MCQ_CORRECT : MASTERY_WEIGHTS.MCQ_INCORRECT;
    } else {
      if (score >= 85) delta = MASTERY_WEIGHTS.OPEN_ENDED_HIGH;
      else if (score >= 60) delta = MASTERY_WEIGHTS.OPEN_ENDED_MEDIUM;
      else delta = MASTERY_WEIGHTS.OPEN_ENDED_LOW;
    }

    const previousScore = masteryRecord.score;
    const newScore = Math.max(5, Math.min(99, previousScore + delta));

    // Determine status
    let status = 'Stable';
    if (newScore < MASTERY_THRESHOLDS.NEEDS_ATTENTION_SCORE) {
      status = 'Requiring Attention';
    } else if (newScore > previousScore + MASTERY_THRESHOLDS.IMPROVING_DELTA || newScore >= 80) {
      status = 'Improving';
    }

    const updated = db.update('concept_mastery', masteryRecord.id, {
      score: newScore,
      status: status,
      evidenceCount: (masteryRecord.evidenceCount || 0) + 1,
      lastAssessedAt: new Date().toISOString()
    });

    // Log history
    db.insert('mastery_history', {
      userId,
      projectId,
      conceptId,
      score: newScore,
      timestamp: new Date().toISOString()
    });

    eventBus.emitEvent({
      userId,
      projectId,
      type: 'MASTERY_UPDATED',
      title: 'Mastery Update',
      details: `${conceptName || 'Concept'} adjusted to ${newScore}% (${status})`
    });

    return updated;
  }

  getProjectMasteryOverview(projectId, userId) {
    const concepts = db.find('concepts', c => c.projectId === projectId);
    const masteryList = db.find('concept_mastery', m => m.projectId === projectId && m.userId === userId);

    const merged = concepts.map(concept => {
      const m = masteryList.find(item => item.conceptId === concept.id);
      return {
        conceptId: concept.id,
        name: concept.name,
        category: concept.category,
        importance: concept.importance,
        score: m ? m.score : 50,
        status: m ? m.status : 'Stable',
        evidenceCount: m ? m.evidenceCount : 0,
        lastAssessedAt: m ? m.lastAssessedAt : null
      };
    });

    const averageScore = merged.length > 0
      ? Math.round(merged.reduce((acc, c) => acc + c.score, 0) / merged.length)
      : 0;

    const improving = merged.filter(c => c.status === 'Improving').length;
    const stable = merged.filter(c => c.status === 'Stable').length;
    const needsAttention = merged.filter(c => c.status === 'Requiring Attention').length;

    return {
      concepts: merged,
      averageScore,
      breakdown: { improving, stable, needsAttention }
    };
  }
}

const masteryEngine = new MasteryEngine();
module.exports = masteryEngine;
