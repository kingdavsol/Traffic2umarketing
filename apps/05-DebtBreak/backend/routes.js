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

// add
router.get('/debts/add', authMiddleware, async (req, res) => {
  try {
    // TODO: Implement add logic
    res.json({ success: true, message: 'add endpoint' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// list
router.get('/debts/list', authMiddleware, async (req, res) => {
  try {
    // TODO: Implement list logic
    res.json({ success: true, message: 'list endpoint' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// payment
router.get('/debts/payment', authMiddleware, async (req, res) => {
  try {
    // TODO: Implement payment logic
    res.json({ success: true, message: 'payment endpoint' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// generate
router.get('/payoff-plan/generate', authMiddleware, async (req, res) => {
  try {
    // TODO: Implement generate logic
    res.json({ success: true, message: 'generate endpoint' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// list
router.get('/milestones/list', authMiddleware, async (req, res) => {
  try {
    // TODO: Implement list logic
    res.json({ success: true, message: 'list endpoint' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
