const db = require('../db/database');
const tutorService = require('../services/tutorService');

exports.getProjectConversation = (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;

  let conversation = db.findOne('conversations', c => c.projectId === projectId && c.userId === userId);
  if (!conversation) {
    conversation = db.insert('conversations', {
      userId,
      projectId,
      title: 'AI Tutor Session'
    });
  }

  const messages = db.find('messages', m => m.conversationId === conversation.id);

  // Retrieve persistent context summary
  const project = db.findById('projects', projectId);
  const masteryList = db.find('concept_mastery', m => m.projectId === projectId && m.userId === userId);
  const weakConcepts = masteryList.filter(m => m.status === 'Requiring Attention' || m.score < 60);
  const strongConcepts = masteryList.filter(m => m.score >= 80);

  res.json({
    conversation,
    messages,
    learnerContext: {
      learningGoal: project?.learningGoal,
      weakConcepts: weakConcepts.map(c => c.conceptName),
      strongConcepts: strongConcepts.map(c => c.conceptName),
      totalConcepts: masteryList.length
    }
  });
};

exports.sendMessage = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { message, conversationId, allowGeneralKnowledge } = req.body;
    const userId = req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    let activeConvId = conversationId;
    if (!activeConvId) {
      let conv = db.findOne('conversations', c => c.projectId === projectId && c.userId === userId);
      if (!conv) {
        conv = db.insert('conversations', { userId, projectId, title: 'AI Tutor Session' });
      }
      activeConvId = conv.id;
    }

    // Save student message
    const userMsg = db.insert('messages', {
      conversationId: activeConvId,
      sender: 'user',
      content: message.trim()
    });

    // Generate grounded tutor response
    const assistantMsg = await tutorService.respondToUser({
      conversationId: activeConvId,
      projectId,
      userId,
      message: message.trim(),
      allowGeneralKnowledge: !!allowGeneralKnowledge
    });

    res.json({
      userMessage: userMsg,
      assistantMessage: assistantMsg
    });
  } catch (err) {
    next(err);
  }
};

exports.clearConversation = (req, res) => {
  const { projectId } = req.params;
  const conv = db.findOne('conversations', c => c.projectId === projectId && c.userId === req.user.id);
  if (conv) {
    db.deleteMany('messages', m => m.conversationId === conv.id);
  }
  res.json({ success: true, message: 'Conversation cleared' });
};
