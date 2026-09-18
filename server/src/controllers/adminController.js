const db = require('../db/database');
const backgroundQueue = require('../services/backgroundQueue');

exports.getAdminDashboard = (req, res) => {
  const users = db.find('users');
  const spaces = db.find('spaces');
  const projects = db.find('projects');
  const materials = db.find('materials');
  const aiLogs = db.find('ai_logs');
  const evaluations = db.find('ai_evaluations');
  const jobs = db.find('background_jobs');

  const totalTokens = aiLogs.reduce((acc, cur) => acc + (cur.totalTokens || 0), 0);
  const totalCost = Number(aiLogs.reduce((acc, cur) => acc + (cur.estimatedCost || 0), 0).toFixed(5));
  const avgLatency = aiLogs.length > 0
    ? Math.round(aiLogs.reduce((acc, cur) => acc + (cur.latencyMs || 0), 0) / aiLogs.length)
    : 0;

  const passedEvals = evaluations.filter(e => e.status === 'PASSED').length;
  const evalPassRate = evaluations.length > 0
    ? Math.round((passedEvals / evaluations.length) * 100)
    : 100;

  res.json({
    metrics: {
      totalUsers: users.length,
      totalSpaces: spaces.length,
      totalProjects: projects.length,
      totalMaterials: materials.length,
      totalAICalls: aiLogs.length,
      totalTokens,
      totalCostUSD: totalCost,
      avgLatencyMs: avgLatency,
      evalPassRate,
      activeBackgroundJobs: jobs.filter(j => j.status === 'PROCESSING' || j.status === 'QUEUED').length
    },
    users,
    recentAILogs: aiLogs.slice(-25).reverse(),
    evaluations,
    backgroundJobs: jobs.slice(-15).reverse()
  });
};

exports.inspectUserJourney = (req, res) => {
  const { userId } = req.params;
  const user = db.findById('users', userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const spaces = db.find('spaces', s => s.userId === userId);
  const projects = db.find('projects', p => p.userId === userId);
  const mastery = db.find('concept_mastery', m => m.userId === userId);
  const quizzes = db.find('quizzes', q => q.userId === userId);
  const aiLogs = db.find('ai_logs', l => l.userId === userId);
  const events = db.find('events', e => e.userId === userId);

  res.json({
    user,
    spaces,
    projects,
    mastery,
    quizzes,
    aiLogs: aiLogs.slice(-20).reverse(),
    events: events.slice(-20).reverse()
  });
};

exports.getTelemetryLogs = (req, res) => {
  const { feature, model, status, isGrounded } = req.query;

  let logs = db.find('ai_logs', log => {
    if (feature && log.feature !== feature) return false;
    if (model && log.model !== model) return false;
    if (status && log.status !== status) return false;
    if (isGrounded !== undefined && String(log.isGrounded) !== isGrounded) return false;
    return true;
  });

  res.json({ logs: logs.slice(-100).reverse() });
};

exports.getBackgroundQueueStatus = (req, res) => {
  const jobs = db.find('background_jobs');
  res.json({
    isWorkerRunning: backgroundQueue.isProcessing,
    totalJobs: jobs.length,
    queued: jobs.filter(j => j.status === 'QUEUED').length,
    processing: jobs.filter(j => j.status === 'PROCESSING').length,
    ready: jobs.filter(j => j.status === 'READY').length,
    failed: jobs.filter(j => j.status === 'FAILED').length,
    jobs: jobs.slice(-30).reverse()
  });
};

exports.resetDatabase = (req, res) => {
  db.reset();
  res.json({ success: true, message: 'Database reset to fresh rich seed state' });
};
