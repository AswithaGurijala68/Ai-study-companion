const db = require('../db/database');

exports.getGlobalAnalytics = (req, res) => {
  const userId = req.user.id;
  const spaces = db.find('spaces', s => s.userId === userId);
  const projects = db.find('projects', p => p.userId === userId);
  const materials = db.find('materials', m => m.userId === userId);
  const masteryRecords = db.find('concept_mastery', m => m.userId === userId);
  const quizzes = db.find('quizzes', q => q.userId === userId);
  const events = db.find('events', e => e.userId === userId);
  const aiLogs = db.find('ai_logs', l => l.userId === userId);

  const avgMastery = masteryRecords.length > 0
    ? Math.round(masteryRecords.reduce((acc, cur) => acc + cur.score, 0) / masteryRecords.length)
    : 0;

  const totalTokens = aiLogs.reduce((acc, cur) => acc + (cur.totalTokens || 0), 0);
  const totalCost = Number(aiLogs.reduce((acc, cur) => acc + (cur.estimatedCost || 0), 0).toFixed(5));

  // Mastery distribution buckets
  const distribution = {
    mastered: masteryRecords.filter(m => m.score >= 80).length,
    competent: masteryRecords.filter(m => m.score >= 60 && m.score < 80).length,
    learning: masteryRecords.filter(m => m.score < 60).length
  };

  // Activity breakdown by type
  const activityByType = {};
  for (const evt of events) {
    activityByType[evt.type] = (activityByType[evt.type] || 0) + 1;
  }

  // Derive the last 7 calendar days from persisted learning events.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayKeys = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    dayKeys.push(d.toISOString().slice(0, 10));
  }
  const counts = Object.fromEntries(dayKeys.map(k => [k, 0]));
  for (const evt of events) {
    const key = new Date(evt.createdAt || evt.timestamp || 0).toISOString().slice(0, 10);
    if (key in counts) counts[key]++;
  }
  const streakDays = dayKeys.map(key => {
    const d = new Date(`${key}T00:00:00`);
    return { day: d.toLocaleDateString('en-US', { weekday: 'short' }), count: counts[key], active: counts[key] > 0 };
  });
  let studyStreakDays = 0;
  for (let i = dayKeys.length - 1; i >= 0; i--) {
    if (counts[dayKeys[i]] > 0) studyStreakDays++; else break;
  }

  res.json({
    metrics: {
      totalSpaces: spaces.length,
      totalProjects: projects.length,
      totalMaterials: materials.length,
      totalConcepts: masteryRecords.length,
      averageMastery: avgMastery,
      quizzesTaken: quizzes.length,
      studyStreakDays,
      totalAITokens: totalTokens,
      totalAICostUSD: totalCost
    },
    masteryDistribution: distribution,
    activityByType,
    streakDays,
    recentEvents: events.slice(-15).reverse()
  });
};

exports.getProjectAnalytics = (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;

  const project = db.findById('projects', projectId);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const masteryRecords = db.find('concept_mastery', m => m.projectId === projectId && m.userId === userId);
  const quizzes = db.find('quizzes', q => q.projectId === projectId && q.userId === userId);
  const questions = db.find('quiz_questions', q => q.projectId === projectId);
  const aiLogs = db.find('ai_logs', l => l.projectId === projectId);
  const events = db.find('events', e => e.projectId === projectId);

  const avgScore = masteryRecords.length > 0
    ? Math.round(masteryRecords.reduce((a, b) => a + b.score, 0) / masteryRecords.length)
    : 0;

  const totalTokens = aiLogs.reduce((acc, cur) => acc + (cur.totalTokens || 0), 0);
  const avgLatency = aiLogs.length > 0
    ? Math.round(aiLogs.reduce((acc, cur) => acc + (cur.latencyMs || 0), 0) / aiLogs.length)
    : 0;

  res.json({
    project,
    averageMastery: avgScore,
    conceptCount: masteryRecords.length,
    quizzesCount: quizzes.length,
    totalQuestionsAnswered: questions.filter(q => q.userAnswer !== null).length,
    aiMetrics: {
      totalCalls: aiLogs.length,
      totalTokens,
      avgLatencyMs: avgLatency
    },
    quizzes: quizzes.slice(-6),
    concepts: masteryRecords,
    events: events.slice(-10).reverse()
  });
};

exports.listEvents = (req, res) => {
  const { projectId, spaceId, type } = req.query;
  const userId = req.user.id;

  let events = db.find('events', e => {
    if (req.user.role !== 'admin' && e.userId !== userId) return false;
    if (projectId && e.projectId !== projectId) return false;
    if (type && e.type !== type) return false;
    return true;
  });

  res.json({ events: events.slice(-50).reverse() });
};
