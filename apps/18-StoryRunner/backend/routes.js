const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Auth middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  // Verify token
  req.userId = 'user-id'; // In production, verify JWT
  next();
};

// list
router.get('/stories/list', authMiddleware, async (req, res) => {
  try {
    // TODO: Implement list logic
    res.json({ success: true, message: 'list endpoint' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// start
router.get('/story/start', authMiddleware, async (req, res) => {
  try {
    // TODO: Implement start logic
    res.json({ success: true, message: 'start endpoint' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// progress
router.get('/story/progress', authMiddleware, async (req, res) => {
  try {
    // TODO: Implement progress logic
    res.json({ success: true, message: 'progress endpoint' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// get
router.get('/branches/get', authMiddleware, async (req, res) => {
  try {
    // TODO: Implement get logic
    res.json({ success: true, message: 'get endpoint' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// submit
router.get('/choices/submit', authMiddleware, async (req, res) => {
  try {
    // TODO: Implement submit logic
    res.json({ success: true, message: 'submit endpoint' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
