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
router.get('/tournaments/list', authMiddleware, async (req, res) => {
  try {
    // TODO: Implement list logic
    res.json({ success: true, message: 'list endpoint' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// join
router.get('/tournaments/join', authMiddleware, async (req, res) => {
  try {
    // TODO: Implement join logic
    res.json({ success: true, message: 'join endpoint' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// play
router.get('/games/play', authMiddleware, async (req, res) => {
  try {
    // TODO: Implement play logic
    res.json({ success: true, message: 'play endpoint' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// submit
router.get('/scores/submit', authMiddleware, async (req, res) => {
  try {
    // TODO: Implement submit logic
    res.json({ success: true, message: 'submit endpoint' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// calculate
router.get('/payouts/calculate', authMiddleware, async (req, res) => {
  try {
    // TODO: Implement calculate logic
    res.json({ success: true, message: 'calculate endpoint' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
