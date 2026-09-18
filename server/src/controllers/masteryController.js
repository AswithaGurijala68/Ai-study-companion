const db = require('../db/database');
const masteryEngine = require('../services/masteryEngine');

exports.getProjectMastery = (req, res) => {
  const { projectId } = req.params;
  const overview = masteryEngine.getProjectMasteryOverview(projectId, req.user.id);
  res.json(overview);
};

exports.getConceptHistory = (req, res) => {
  const { projectId, conceptId } = req.params;
  const history = db.find('mastery_history', h => 
    h.projectId === projectId && 
    h.userId === req.user.id && 
    (conceptId ? h.conceptId === conceptId : true)
  );
  res.json({ history });
};

exports.getKnowledgeGraph = (req, res) => {
  const { projectId } = req.params;
  const concepts = db.find('concepts', c => c.projectId === projectId);
  const masteryList = db.find('concept_mastery', m => m.projectId === projectId && m.userId === req.user.id);

  // Construct graph nodes
  const nodes = concepts.map(c => {
    const m = masteryList.find(item => item.conceptId === c.id);
    const score = m ? m.score : 50;
    let statusColor = '#eab308'; // yellow
    if (score >= 75) statusColor = '#22c55e'; // green
    else if (score < 60) statusColor = '#ef4444'; // red

    return {
      id: c.id,
      name: c.name,
      category: c.category || 'General',
      score: score,
      status: m ? m.status : 'Stable',
      color: statusColor,
      description: c.description
    };
  });

  // Construct contextual relationships/edges
  const edges = [];
  for (let i = 0; i < nodes.length; i++) {
    if (i + 1 < nodes.length) {
      edges.push({
        source: nodes[i].id,
        target: nodes[i + 1].id,
        relation: 'relates_to'
      });
    }
    if (i > 1 && i % 2 === 0) {
      edges.push({
        source: nodes[0].id,
        target: nodes[i].id,
        relation: 'foundation_for'
      });
    }
  }

  res.json({ nodes, edges });
};

// Flashcards & Spaced Repetition (SM-2 Algorithm)
exports.getFlashcards = (req, res) => {
  const { projectId } = req.params;
  const flashcards = db.find('flashcards', f => f.projectId === projectId);
  res.json({ flashcards });
};

exports.reviewFlashcard = (req, res) => {
  const { id } = req.params;
  const { rating } = req.body; // 1: Again, 2: Hard, 3: Good, 4: Easy
  const card = db.findById('flashcards', id);
  if (!card) return res.status(404).json({ error: 'Flashcard not found' });

  // SuperMemo SM-2 calculation
  let { interval = 1, repetitions = 0, easeFactor = 2.5 } = card;
  const q = Number(rating) || 3;

  if (q >= 3) {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 3;
    else interval = Math.round(interval * easeFactor);
    repetitions++;
  } else {
    repetitions = 0;
    interval = 1;
  }

  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  const nextDueDate = new Date(Date.now() + interval * 86400000).toISOString();

  const updatedCard = db.update('flashcards', id, {
    interval,
    repetitions,
    easeFactor: Number(easeFactor.toFixed(2)),
    dueDate: nextDueDate
  });

  res.json({ flashcard: updatedCard });
};

// Study Plan Roadmap
exports.getRoadmap = (req, res) => {
  const { projectId } = req.params;
  let roadmap = db.findOne('roadmaps', r => r.projectId === projectId);
  if (!roadmap) {
    roadmap = db.insert('roadmaps', {
      projectId,
      title: 'Active Study Plan',
      milestones: []
    });
  }
  res.json({ roadmap });
};

exports.updateMilestoneStatus = (req, res) => {
  const { projectId, milestoneId } = req.params;
  const { status } = req.body; // completed, in_progress, pending

  const roadmap = db.findOne('roadmaps', r => r.projectId === projectId);
  if (!roadmap) return res.status(404).json({ error: 'Roadmap not found' });

  const updatedMilestones = roadmap.milestones.map(m => 
    m.id === milestoneId ? { ...m, status } : m
  );

  const updated = db.update('roadmaps', roadmap.id, { milestones: updatedMilestones });
  res.json({ roadmap: updated });
};
