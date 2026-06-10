const express = require('express');
const router = express.Router();

const { protect, adminOnly } = require('../middleware/authMiddleware');
const db = require('../config/db');

// Import controllers
const authController = require('../controllers/authController');
const eligibilityController = require('../controllers/eligibilityController');
const roadmapController = require('../controllers/roadmapController');
const subjectController = require('../controllers/subjectController');
const testController = require('../controllers/testController');
const currentAffairsController = require('../controllers/currentAffairsController');
const feedbackController = require('../controllers/feedbackController');
const communityController = require('../controllers/communityController');
const aiController = require('../controllers/aiController');
const adminController = require('../controllers/adminController');

// 1. Authentication & Profile
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/profile', protect, authController.getProfile);
router.post('/auth/streak', protect, authController.updateStreak);

// 2. Eligibility
router.post('/eligibility/check', eligibilityController.checkEligibility);

// 3. Roadmaps
router.get('/roadmaps', roadmapController.getRoadmaps);
router.get('/roadmaps/:id', roadmapController.getRoadmapById);

// 4. Subjects & Topics
router.get('/subjects', subjectController.getSubjects);
// Optional middleware check so we can render completed status for logged in users
router.get('/topics', (req, res, next) => {
  if (req.headers.authorization) {
    protect(req, res, next);
  } else {
    next();
  }
}, subjectController.getTopics);
router.post('/topics/:id/progress', protect, subjectController.toggleTopicProgress);

// 5. Mock Tests
router.get('/tests/attempts', protect, testController.getAttempts);
router.get('/tests/analytics', protect, testController.getAnalytics);
router.get('/tests', testController.getTests);
router.get('/tests/:id', testController.getTestQuestions);
router.post('/tests/:id/submit', protect, testController.submitTest);
router.get('/tests/:id/leaderboard', testController.getTestLeaderboard);

// 6. Current Affairs
router.get('/current-affairs', currentAffairsController.getCurrentAffairs);
router.get('/current-affairs/pdf-compilations', currentAffairsController.getMonthlyCompilations);

// 7. Feedback
router.post('/feedback', (req, res, next) => {
  if (req.headers.authorization) {
    protect(req, res, next);
  } else {
    next();
  }
}, feedbackController.submitFeedback);

// 8. Forum
router.get('/forum/posts', communityController.getPosts);
router.get('/forum/posts/:id', communityController.getPostDetails);
router.post('/forum/posts', protect, communityController.createPost);
router.put('/forum/posts/:id', protect, communityController.updatePost);
router.delete('/forum/posts/:id', protect, communityController.deletePost);
router.post('/forum/comments', protect, communityController.createComment);

// 9. AI Assistant
router.post('/ai/chat', aiController.chat);

// 10. Notifications (Public & role based)
router.get('/notifications', async (req, res) => {
  try {
    const list = await db.query('SELECT * FROM notifications ORDER BY id DESC LIMIT 5');
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving notifications', error: err.message });
  }
});

// 11. Free Resources
router.get('/resources', async (req, res) => {
  const { category, search } = req.query;
  let sql = 'SELECT * FROM resources';
  const params = [];
  const conditions = [];

  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }
  if (search) {
    conditions.push('title LIKE ?');
    params.push(`%${search}%`);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  try {
    const list = await db.query(sql, params);
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving resources', error: err.message });
  }
});

// 12. Admin CRUD and operations
router.get('/admin/stats', protect, adminOnly, adminController.getStats);
router.get('/admin/users', protect, adminOnly, adminController.getUsers);
router.post('/admin/resources', protect, adminOnly, adminController.addResource);
router.post('/admin/tests', protect, adminOnly, adminController.addTest);
router.post('/admin/notifications', protect, adminOnly, adminController.postNotification);
router.post('/admin/current-affairs', protect, adminOnly, adminController.addCurrentAffairs);
router.delete('/admin/posts/:id', protect, adminOnly, adminController.deletePost);
router.get('/admin/feedback', protect, adminOnly, feedbackController.getAllFeedback);
router.put('/admin/feedback/:id', protect, adminOnly, adminController.resolveFeedback);
router.get('/admin/diagnostics', protect, adminOnly, adminController.getDiagnostics);

module.exports = router;
