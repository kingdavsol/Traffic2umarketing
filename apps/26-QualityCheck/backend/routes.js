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

// submit
router.get('/reviews/submit', authMiddleware, async (req, res) => {
  try {
    // TODO: Implement submit logic
    res.json({ success: true, message: 'submit endpoint' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// list
router.get('/reviews/list', authMiddleware, async (req, res) => {
  try {
    // TODO: Implement list logic
    res.json({ success: true, message: 'list endpoint' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// verify
router.get('/reviewers/verify', authMiddleware, async (req, res) => {
  try {
    // TODO: Implement verify logic
    res.json({ success: true, message: 'verify endpoint' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// earn
router.get('/rewards/earn', authMiddleware, async (req, res) => {
  try {
    // TODO: Implement earn logic
    res.json({ success: true, message: 'earn endpoint' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// report
router.get('/fraud/report', authMiddleware, async (req, res) => {
  try {
    // TODO: Implement report logic
    res.json({ success: true, message: 'report endpoint' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
