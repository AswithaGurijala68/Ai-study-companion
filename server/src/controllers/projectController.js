const db = require('../db/database');
const eventBus = require('../services/eventBus');
const masteryEngine = require('../services/masteryEngine');
const recommendationEngine = require('../services/recommendationEngine');

exports.listProjects = (req, res) => {
  const { spaceId } = req.query;
  const userId = req.user.id;

  let projects = db.find('projects', p => {
    const userMatch = req.user.role === 'admin' || p.userId === userId;
    const spaceMatch = spaceId ? p.spaceId === spaceId : true;
    return userMatch && spaceMatch;
  });

  const populated = projects.map(proj => {
    const space = db.findById('spaces', proj.spaceId);
    const materials = db.find('materials', m => m.projectId === proj.id);
    const masteryData = masteryEngine.getProjectMasteryOverview(proj.id, userId);

    return {
      ...proj,
      spaceName: space ? space.name : 'General Space',
      spaceColor: space ? space.color : 'indigo',
      materialCount: materials.length,
      conceptCount: masteryData.concepts.length,
      averageMastery: masteryData.averageScore
    };
  });

  res.json({ projects: populated });
};

exports.createProject = (req, res) => {
  const { spaceId, name, description, learningGoal, targetMastery } = req.body;
  if (!spaceId || !name) {
    return res.status(400).json({ error: 'Space ID and project name are required.' });
  }

  const space = db.findById('spaces', spaceId);
  if (!space) {
    return res.status(404).json({ error: 'Space not found' });
  }
  if (req.user.role !== 'admin' && space.userId !== req.user.id) return res.status(403).json({ error: 'Access denied: this Space does not belong to you.' });

  const goal = learningGoal || `Master foundational and applied concepts in ${name}`;

  const newProject = db.insert('projects', {
    userId: req.user.id,
    spaceId,
    name,
    description: description || '',
    learningGoal: goal,
    targetMastery: Number(targetMastery) || 85,
    status: 'active'
  });

  // Seed initial domain concepts
  const initialConcepts = [
    { name: `${name} Fundamentals`, desc: `Core theoretical definitions and fundamentals of ${name}.` },
    { name: `${name} Operational Mechanics`, desc: `Standard functional mechanisms, calculations, and architecture.` },
    { name: `${name} System Tradeoffs`, desc: `Performance, computational constraints, and optimization strategies.` }
  ];

  for (const c of initialConcepts) {
    const conceptRec = db.insert('concepts', {
      projectId: newProject.id,
      name: c.name,
      description: c.desc,
      category: 'Core Concepts',
      importance: 'high'
    });

    db.insert('concept_mastery', {
      userId: req.user.id,
      projectId: newProject.id,
      conceptId: conceptRec.id,
      conceptName: c.name,
      score: 50,
      status: 'Stable',
      evidenceCount: 0,
      lastAssessedAt: new Date().toISOString()
    });

    // Seed initial flashcard
    db.insert('flashcards', {
      projectId: newProject.id,
      userId: req.user.id,
      conceptId: conceptRec.id,
      front: `What is the primary role of ${c.name}?`,
      back: `${c.desc} Crucial for achieving the goal: "${goal}".`,
      interval: 1,
      easeFactor: 2.5,
      repetitions: 0,
      nextReviewDate: new Date().toISOString()
    });
  }

  // Create default roadmap
  db.insert('roadmaps', {
    projectId: newProject.id,
    title: `Learning Journey: ${name}`,
    milestones: [
      { id: 'm-1', title: 'Upload & Process Core Materials', description: 'Provide textbooks, slides, or notes.', status: 'in_progress' },
      { id: 'm-2', title: 'Foundational AI Tutoring Session', description: 'Discuss core theoretical mechanics with the AI Tutor.', status: 'pending' },
      { id: 'm-3', title: 'First Adaptive Assessment', description: 'Test baseline understanding with dynamic questions.', status: 'pending' },
      { id: 'm-4', title: 'Target Weak Concept Revision', description: 'Strengthen concepts needing attention to reach target mastery.', status: 'pending' }
    ]
  });

  eventBus.emitEvent({
    userId: req.user.id,
    projectId: newProject.id,
    type: 'PROJECT_CREATED',
    title: 'New Project Created',
    details: `Created Project: "${name}" in Space "${space.name}"`
  });

  res.status(201).json({ project: newProject });
};

exports.getProjectWorkspace = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const project = db.findById('projects', id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const space = db.findById('spaces', project.spaceId);
  const materials = db.find('materials', m => m.projectId === id);
  const chunks = db.find('document_chunks', c => c.projectId === id);
  const masteryOverview = masteryEngine.getProjectMasteryOverview(id, userId);
  const recommendations = await recommendationEngine.generateProjectRecommendations({ projectId: id, userId });
  const roadmap = db.findOne('roadmaps', r => r.projectId === id);
  const flashcards = db.find('flashcards', f => f.projectId === id);
  const quizzes = db.find('quizzes', q => q.projectId === id && q.userId === userId);
  const recentEvents = db.find('events', e => e.projectId === id).slice(-8).reverse();

  res.json({
    project: {
      ...project,
      spaceName: space ? space.name : 'General Space',
      spaceColor: space ? space.color : 'indigo'
    },
    materials,
    chunkCount: chunks.length,
    masteryOverview,
    recommendations,
    roadmap,
    flashcardsCount: flashcards.length,
    quizzes,
    recentEvents
  });
};

exports.updateProject = (req, res) => {
  const { id } = req.params;
  const project = db.findById('projects', id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  if (req.user.role !== 'admin' && project.userId !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized to edit this project' });
  }

  const updated = db.update('projects', id, req.body);
  res.json({ project: updated });
};

exports.deleteProject = (req, res) => {
  const { id } = req.params;
  const project = db.findById('projects', id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  if (req.user.role !== 'admin' && project.userId !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized to delete this project' });
  }

  db.delete('projects', id);
  db.deleteMany('materials', m => m.projectId === id);
  db.deleteMany('document_chunks', c => c.projectId === id);
  db.deleteMany('concepts', c => c.projectId === id);
  db.deleteMany('concept_mastery', m => m.projectId === id);
  db.deleteMany('quizzes', q => q.projectId === id);
  db.deleteMany('flashcards', f => f.projectId === id);

  res.json({ success: true, message: 'Project and all isolated assets deleted' });
};
