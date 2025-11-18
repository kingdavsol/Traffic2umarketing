const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const basicAuth = require('express-basic-auth');
const path = require('path');
require('dotenv').config();

const db = require('./lib/db');
const logger = require('./lib/logger');
const api = require('./routes/api');
const dashboard = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip
    });
  });

  next();
});

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Basic authentication for dashboard
const auth = basicAuth({
  users: { [ADMIN_USERNAME]: ADMIN_PASSWORD },
  challenge: true,
  realm: 'Traffic2u Monitoring Dashboard'
});

// Initialize database
db.init();

// API routes (no auth required for metrics collection)
app.use('/api', api);

// Dashboard routes (auth required)
app.use('/dashboard', auth, dashboard);

// Redirect root to dashboard
app.get('/', (req, res) => {
  res.redirect('/dashboard');
});

// Health check endpoint with monitoring info
app.get('/health', async (req, res) => {
  try {
    const appsCount = await db.get('SELECT COUNT(*) as count FROM apps');
    const todayStats = await db.get(`
      SELECT COUNT(DISTINCT app_id) as active_apps FROM daily_stats
      WHERE date = DATE()
    `);

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: NODE_ENV,
      uptime: process.uptime(),
      memory: {
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + 'MB',
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB'
      },
      database: {
        totalApps: appsCount?.count || 0,
        activeAppsToday: todayStats?.active_apps || 0
      }
    });
  } catch (error) {
    logger.error('Health check error:', { error: error.message });
    res.status(500).json({
      status: 'error',
      error: 'Health check failed'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    path: req.path
  });

  res.status(err.status || 500).json({
    error: NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path
  });
});

const server = app.listen(PORT, () => {
  logger.info('Server started', {
    port: PORT,
    environment: NODE_ENV,
    adminUser: ADMIN_USERNAME,
    dashboardUrl: `http://localhost:${PORT}/dashboard`
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down gracefully...');
  db.close();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
