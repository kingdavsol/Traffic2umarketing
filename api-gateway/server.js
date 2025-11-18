const express = require('express');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const redis = require('redis');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later'
});
app.use(limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Service discovery endpoints
const apps = [
  { id: 1, name: 'SnapSave', port: 5001 },
  { id: 2, name: 'CashFlowMap', port: 5002 },
  { id: 3, name: 'GigStack', port: 5003 },
  { id: 4, name: 'VaultPay', port: 5004 },
  { id: 5, name: 'DebtBreak', port: 5005 },
  { id: 6, name: 'PeriFlow', port: 5006 },
  { id: 7, name: 'TeleDocLocal', port: 5007 },
  { id: 8, name: 'NutriBalance', port: 5008 },
  { id: 9, name: 'MentalMate', port: 5009 },
  { id: 10, name: 'ActiveAge', port: 5010 },
  { id: 11, name: 'TaskBrain', port: 5011 },
  { id: 12, name: 'MemoShift', port: 5012 },
  { id: 13, name: 'CodeSnap', port: 5013 },
  { id: 14, name: 'DraftMate', port: 5014 },
  { id: 15, name: 'FocusFlow', port: 5015 },
  { id: 16, name: 'PuzzleQuest', port: 5016 },
  { id: 17, name: 'CityBuilderLite', port: 5017 },
  { id: 18, name: 'StoryRunner', port: 5018 },
  { id: 19, name: 'SkillMatch', port: 5019 },
  { id: 20, name: 'ZenGarden', port: 5020 },
  { id: 21, name: 'GuardVault', port: 5021 },
  { id: 22, name: 'NoTrace', port: 5022 },
  { id: 23, name: 'CipherText', port: 5023 },
  { id: 24, name: 'LocalEats', port: 5024 },
  { id: 25, name: 'ArtisanHub', port: 5025 },
  { id: 26, name: 'QualityCheck', port: 5026 },
  { id: 27, name: 'SkillBarter', port: 5027 },
  { id: 28, name: 'ClimateTrack', port: 5028 },
  { id: 29, name: 'CrewNetwork', port: 5029 },
  { id: 30, name: 'AuraRead', port: 5030 }
];

// Service registry
app.get('/api/services', (req, res) => {
  res.json(apps.map(app => ({
    name: app.name,
    url: `http://localhost:${app.port}`,
    internal: `http://${app.name.replace(/[A-Z]/g, l => l === app.name[0] ? l : l.toLowerCase())}:${app.port}`
  })));
});

// Proxy routes to individual services
app.use('/api/:service', (req, res) => {
  const service = apps.find(a => a.name.toLowerCase().replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase() === req.params.service.toLowerCase());

  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }

  const targetUrl = `http://localhost:${service.port}${req.originalUrl.replace(/^\/api\/[^\/]+/, '')}`;

  require('http-proxy').createProxyServer({
    target: targetUrl,
    changeOrigin: true
  }).web(req, res);
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Gateway listening on port ${PORT}`);
});

module.exports = app;
