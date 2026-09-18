const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { authMiddleware, requireAdmin, enforceProjectIsolation, enforceResourceIsolation } = require('../middleware/authMiddleware');

const authController = require('../controllers/authController');
const spaceController = require('../controllers/spaceController');
const projectController = require('../controllers/projectController');
const materialController = require('../controllers/materialController');
const tutorController = require('../controllers/tutorController');
const quizController = require('../controllers/quizController');
const masteryController = require('../controllers/masteryController');
const recommendationController = require('../controllers/recommendationController');
const analyticsController = require('../controllers/analyticsController');
const adminController = require('../controllers/adminController');
const evalController = require('../controllers/evalController');
const aiService = require('../services/aiService');

// Multer Storage Configuration
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_'));
  }
});
const upload = multer({ storage, limits: { fileSize: 15 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
  if (file.mimetype !== 'application/pdf' && !file.originalname.toLowerCase().endsWith('.pdf')) return cb(new Error('Only PDF files are supported.'));
  cb(null, true);
} });

// Public authentication endpoints
router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);

// All application data requires authentication
router.use(authMiddleware);

// Auth Routes
router.get('/auth/me', authController.getCurrentUser);

// Spaces Routes
router.get('/spaces', spaceController.listSpaces);
router.post('/spaces', spaceController.createSpace);
router.get('/spaces/:id', spaceController.getSpaceById);
router.put('/spaces/:id', spaceController.updateSpace);
router.delete('/spaces/:id', spaceController.deleteSpace);

// Projects Routes
router.get('/projects', projectController.listProjects);
router.post('/projects', projectController.createProject);
router.get('/projects/:id/workspace', enforceProjectIsolation, projectController.getProjectWorkspace);
router.put('/projects/:id', enforceProjectIsolation, projectController.updateProject);
router.delete('/projects/:id', enforceProjectIsolation, projectController.deleteProject);

// Materials Routes
router.get('/projects/:projectId/materials', enforceProjectIsolation, materialController.listMaterials);
router.post('/projects/:projectId/materials', enforceProjectIsolation, upload.single('file'), materialController.uploadMaterial);
router.get('/materials/:id/status', enforceResourceIsolation('materials'), materialController.getMaterialStatus);
router.get('/materials/:id/chunks', enforceResourceIsolation('materials'), materialController.getMaterialChunks);
router.post('/materials/:id/retry', enforceResourceIsolation('materials'), materialController.retryProcessing);
router.delete('/materials/:id', enforceResourceIsolation('materials'), materialController.deleteMaterial);

// Tutor Routes
router.get('/projects/:projectId/tutor', enforceProjectIsolation, tutorController.getProjectConversation);
router.post('/projects/:projectId/tutor/message', enforceProjectIsolation, tutorController.sendMessage);
router.delete('/projects/:projectId/tutor/clear', enforceProjectIsolation, tutorController.clearConversation);

// Adaptive Quiz Routes
router.post('/projects/:projectId/quiz/adaptive', enforceProjectIsolation, quizController.startAdaptiveQuiz);
router.get('/quiz/:id', enforceResourceIsolation('quizzes'), quizController.getQuiz);
router.post('/quiz/questions/:questionId/answer', enforceResourceIsolation('quiz_questions', { collection: 'quizzes', field: 'quizId' }), quizController.submitAnswer);
router.post('/quiz/:id/complete', enforceResourceIsolation('quizzes'), quizController.completeQuiz);
router.get('/projects/:projectId/quizzes', enforceProjectIsolation, quizController.listProjectQuizzes);

// Mastery & Creative Tool Routes
router.get('/projects/:projectId/mastery', enforceProjectIsolation, masteryController.getProjectMastery);
router.get('/projects/:projectId/mastery/history', enforceProjectIsolation, masteryController.getConceptHistory);
router.get('/projects/:projectId/knowledge-graph', enforceProjectIsolation, masteryController.getKnowledgeGraph);
router.get('/projects/:projectId/flashcards', enforceProjectIsolation, masteryController.getFlashcards);
router.post('/flashcards/:id/review', enforceResourceIsolation('flashcards'), masteryController.reviewFlashcard);
router.get('/projects/:projectId/roadmap', enforceProjectIsolation, masteryController.getRoadmap);
router.put('/projects/:projectId/roadmap/milestones/:milestoneId', enforceProjectIsolation, masteryController.updateMilestoneStatus);

// Recommendation Routes
router.get('/projects/:projectId/recommendations', enforceProjectIsolation, recommendationController.getProjectRecommendations);
router.get('/recommendations/global', recommendationController.getGlobalRecommendations);
router.post('/recommendations/:id/dismiss', enforceResourceIsolation('recommendations'), recommendationController.dismissRecommendation);

// Analytics & Activity Routes
router.get('/analytics/global', analyticsController.getGlobalAnalytics);
router.get('/analytics/projects/:projectId', enforceProjectIsolation, analyticsController.getProjectAnalytics);
router.get('/events', analyticsController.listEvents);

// Admin Dashboard & Observability Routes
router.get('/admin/dashboard', requireAdmin, adminController.getAdminDashboard);
router.get('/admin/users/:userId/journey', requireAdmin, adminController.inspectUserJourney);
router.get('/admin/telemetry', requireAdmin, adminController.getTelemetryLogs);
router.get('/admin/queue', requireAdmin, adminController.getBackgroundQueueStatus);
router.post('/admin/reset-db', requireAdmin, adminController.resetDatabase);

// AI Evaluation Benchmark Routes
router.get('/evaluations', evalController.listEvaluations);
router.post('/evaluations/run', evalController.runBenchmarks);

// AI System Settings & Key Config
router.get('/config/ai', (req, res) => {
  res.json({
    hasApiKey: !!aiService.apiKey,
    preferredModel: aiService.preferredModel,
    availableModels: ['gemini-1.5-flash', 'gemini-1.5-pro', 'built-in-local-engine']
  });
});

router.post('/config/ai', (req, res) => {
  const { apiKey, preferredModel } = req.body;
  if (apiKey !== undefined) aiService.setApiKey(apiKey ? apiKey.trim() : null);
  if (preferredModel) aiService.setPreferredModel(preferredModel);
  res.json({
    success: true,
    hasApiKey: !!aiService.apiKey,
    preferredModel: aiService.preferredModel
  });
});

module.exports = router;
