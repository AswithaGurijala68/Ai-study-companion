const db = require('../db/database');
const eventBus = require('../services/eventBus');

exports.listSpaces = (req, res) => {
  const userId = req.user.id;
  const spaces = db.find('spaces', s => req.user.role === 'admin' || s.userId === userId);

  // Attach metrics for each space
  const populated = spaces.map(space => {
    const projects = db.find('projects', p => p.spaceId === space.id);
    const materials = db.find('materials', m => projects.some(p => p.id === m.projectId));
    const masteryList = db.find('concept_mastery', m => projects.some(p => p.id === m.projectId) && m.userId === userId);

    const avgMastery = masteryList.length > 0
      ? Math.round(masteryList.reduce((acc, cur) => acc + cur.score, 0) / masteryList.length)
      : 0;

    return {
      ...space,
      projectCount: projects.length,
      materialCount: materials.length,
      averageMastery: avgMastery
    };
  });

  res.json({ spaces: populated });
};

exports.createSpace = (req, res) => {
  const { name, description, icon, color, tags } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Space name is required.' });
  }

  const newSpace = db.insert('spaces', {
    userId: req.user.id,
    name,
    description: description || '',
    icon: icon || 'Brain',
    color: color || 'indigo',
    tags: tags || []
  });

  eventBus.emitEvent({
    userId: req.user.id,
    type: 'SPACE_CREATED',
    title: 'New Space Created',
    details: `Created Space: "${name}"`
  });

  res.status(201).json({ space: newSpace });
};

exports.getSpaceById = (req, res) => {
  const { id } = req.params;
  const space = db.findById('spaces', id);
  if (!space) { return res.status(404).json({ error: 'Space not found' }); }
  if (req.user.role !== 'admin' && space.userId !== req.user.id) return res.status(403).json({ error: 'Access denied.' });

  // Find projects within this space
  const projects = db.find('projects', p => p.spaceId === id);
  const populatedProjects = projects.map(proj => {
    const materials = db.find('materials', m => m.projectId === proj.id);
    const mastery = db.find('concept_mastery', m => m.projectId === proj.id && m.userId === req.user.id);
    const avgScore = mastery.length > 0
      ? Math.round(mastery.reduce((a, b) => a + b.score, 0) / mastery.length)
      : 0;

    return {
      ...proj,
      materialCount: materials.length,
      conceptCount: mastery.length,
      currentMastery: avgScore
    };
  });

  res.json({
    space,
    projects: populatedProjects
  });
};

exports.updateSpace = (req, res) => {
  const { id } = req.params;
  const space = db.findById('spaces', id);
  if (!space) return res.status(404).json({ error: 'Space not found' });

  if (req.user.role !== 'admin' && space.userId !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized to edit this space' });
  }

  const updated = db.update('spaces', id, req.body);
  res.json({ space: updated });
};

exports.deleteSpace = (req, res) => {
  const { id } = req.params;
  const space = db.findById('spaces', id);
  if (!space) return res.status(404).json({ error: 'Space not found' });

  if (req.user.role !== 'admin' && space.userId !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized to delete this space' });
  }

  db.delete('spaces', id);
  res.json({ success: true, message: 'Space deleted' });
};
