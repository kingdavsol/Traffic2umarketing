const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const db = require('../lib/db');
const logger = require('../lib/logger');
const validation = require('../lib/validation');
const apiKeys = require('../lib/api-keys');

// Initialize API keys
apiKeys.initializeApiKeys();

// Rate limiting for metrics endpoint (100 requests per hour per app)
const metricsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,
  keyGenerator: (req) => {
    return req.body?.appName || req.ip; // Limit by app name or IP
  },
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      appName: req.body?.appName,
      ip: req.ip
    });
    res.status(429).json({
      error: 'Too many requests. Please try again later.'
    });
  }
});

// API Key validation middleware
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  const appName = req.body?.appName || '';

  if (!apiKey) {
    logger.warn('Missing API key', { appName, ip: req.ip });
    return res.status(401).json({
      error: 'Missing X-API-Key header or api_key query parameter'
    });
  }

  const verification = apiKeys.verifyApiKey(appName, apiKey);
  if (!verification.valid) {
    logger.warn('Invalid API key', { appName, ip: req.ip });
    return res.status(401).json({
      error: 'Invalid API key'
    });
  }

  req.apiKeyValid = true;
  logger.debug('API key verified', { appName, usageCount: verification.usageCount });
  next();
};

// Register or get app
async function getOrCreateApp(appName, displayName) {
  try {
    let app = await db.get('SELECT * FROM apps WHERE name = ?', [appName]);
    if (!app) {
      await db.run('INSERT INTO apps (name, display_name) VALUES (?, ?)',
        [appName, displayName || appName]);
      app = await db.get('SELECT * FROM apps WHERE name = ?', [appName]);
      logger.info('New app registered', { appName, displayName });
    }
    return app;
  } catch (error) {
    logger.error('Error in getOrCreateApp:', { appName, error: error.message });
    throw error;
  }
}

// POST /api/metrics - Submit metrics for an app
router.post('/metrics', metricsLimiter, validateApiKey, async (req, res) => {
  try {
    // Validate submission
    const validation_result = validation.validateMetricsSubmission(req.body);
    if (!validation_result.isValid) {
      logger.warn('Invalid metrics submission', {
        appName: req.body?.appName,
        errors: validation_result.errors
      });
      return res.status(400).json({
        error: 'Invalid submission',
        details: validation_result.errors
      });
    }

    const { appName, displayName, date, metrics } = req.body;

    const app = await getOrCreateApp(appName, displayName);
    const metricDate = date || new Date().toISOString().split('T')[0];

    // Get or create daily stats record
    let dayStats = await db.get(
      'SELECT id FROM daily_stats WHERE app_id = ? AND date = ?',
      [app.id, metricDate]
    );

    if (!dayStats) {
      await db.run(
        `INSERT INTO daily_stats (app_id, date) VALUES (?, ?)`,
        [app.id, metricDate]
      );
      dayStats = await db.get(
        'SELECT id FROM daily_stats WHERE app_id = ? AND date = ?',
        [app.id, metricDate]
      );
    }

    // Update metrics
    const updateFields = [];
    const values = [];

    if (metrics.users !== undefined) {
      updateFields.push('users = ?');
      values.push(metrics.users);
    }
    if (metrics.activeUsers !== undefined) {
      updateFields.push('active_users = ?');
      values.push(metrics.activeUsers);
    }
    if (metrics.downloads !== undefined) {
      updateFields.push('downloads = ?');
      values.push(metrics.downloads);
    }
    if (metrics.revenue !== undefined) {
      updateFields.push('revenue = ?');
      values.push(metrics.revenue);
    }
    if (metrics.adImpressions !== undefined) {
      updateFields.push('ad_impressions = ?');
      values.push(metrics.adImpressions);
    }
    if (metrics.adClicks !== undefined) {
      updateFields.push('ad_clicks = ?');
      values.push(metrics.adClicks);
    }
    if (metrics.sessions !== undefined) {
      updateFields.push('sessions = ?');
      values.push(metrics.sessions);
    }

    if (updateFields.length > 0) {
      values.push(dayStats.id);
      const query = `UPDATE daily_stats SET ${updateFields.join(', ')} WHERE id = ?`;
      await db.run(query, values);
    }

    // Handle custom metrics
    if (metrics.custom && typeof metrics.custom === 'object') {
      for (const [key, value] of Object.entries(metrics.custom)) {
        await db.run(
          `INSERT INTO custom_metrics (app_id, metric_name, metric_value, date)
           VALUES (?, ?, ?, ?)`,
          [app.id, key, JSON.stringify(value), metricDate]
        );
      }
    }

    logger.info('Metrics recorded', {
      appName: app.name,
      date: metricDate,
      metricsCount: Object.keys(metrics).length
    });

    res.json({
      success: true,
      message: 'Metrics recorded',
      appId: app.id,
      appName: app.name
    });
  } catch (error) {
    logger.error('Error recording metrics:', {
      appName: req.body?.appName,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to record metrics' });
  }
});

// POST /api/apps - Register or list apps
router.post('/apps', async (req, res) => {
  try {
    const { appName, displayName } = req.body;

    if (!appName) {
      return res.status(400).json({ error: 'Missing appName' });
    }

    const app = await getOrCreateApp(appName, displayName);
    res.json({ success: true, app });
  } catch (error) {
    console.error('Error registering app:', error);
    res.status(500).json({ error: 'Failed to register app' });
  }
});

// GET /api/apps - List all registered apps
router.get('/apps', async (req, res) => {
  try {
    const apps = await db.all('SELECT * FROM apps ORDER BY name ASC');
    res.json(apps);
  } catch (error) {
    console.error('Error fetching apps:', error);
    res.status(500).json({ error: 'Failed to fetch apps' });
  }
});

// GET /api/apps/:appId/stats - Get stats for specific app
router.get('/apps/:appId/stats', async (req, res) => {
  try {
    const { appId } = req.params;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    const dateStr = startDate.toISOString().split('T')[0];

    const stats = await db.all(
      `SELECT * FROM daily_stats
       WHERE app_id = ? AND date >= ?
       ORDER BY date DESC`,
      [appId, dateStr]
    );

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /api/apps/:appId/summary - Get summary for specific app
router.get('/apps/:appId/summary', async (req, res) => {
  try {
    const { appId } = req.params;

    const app = await db.get('SELECT * FROM apps WHERE id = ?', [appId]);
    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    const today = await db.get(
      'SELECT * FROM daily_stats WHERE app_id = ? AND date = DATE()',
      [appId]
    );

    const stats = await db.all(
      `SELECT * FROM daily_stats WHERE app_id = ? ORDER BY date DESC LIMIT 30`,
      [appId]
    );

    const summary = {
      app,
      today: today || {},
      last30Days: stats
    };

    res.json(summary);
  } catch (error) {
    logger.error('Error fetching summary:', { appId, error: error.message });
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// GET /api/export/csv - Export all data as CSV
router.get('/export/csv', async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    const dateStr = startDate.toISOString().split('T')[0];

    const data = await db.all(`
      SELECT
        a.display_name as app_name,
        ds.date,
        ds.users,
        ds.active_users,
        ds.downloads,
        ds.revenue,
        ds.ad_impressions,
        ds.ad_clicks,
        ds.sessions
      FROM daily_stats ds
      JOIN apps a ON ds.app_id = a.id
      WHERE ds.date >= ?
      ORDER BY ds.date DESC, a.display_name ASC
    `, [dateStr]);

    // Format CSV
    const csv = [
      ['App Name', 'Date', 'Users', 'Active Users', 'Downloads', 'Revenue', 'Ad Impressions', 'Ad Clicks', 'Sessions'],
      ...data.map(row => [
        row.app_name,
        row.date,
        row.users,
        row.active_users,
        row.downloads,
        row.revenue,
        row.ad_impressions,
        row.ad_clicks,
        row.sessions
      ])
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="metrics-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);

    logger.info('Data exported to CSV', { rows: data.length, days });
  } catch (error) {
    logger.error('Error exporting CSV:', { error: error.message });
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// GET /api/export/json - Export all data as JSON
router.get('/export/json', async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    const dateStr = startDate.toISOString().split('T')[0];

    const data = await db.all(`
      SELECT
        a.id,
        a.name,
        a.display_name,
        ds.date,
        ds.users,
        ds.active_users,
        ds.downloads,
        ds.revenue,
        ds.ad_impressions,
        ds.ad_clicks,
        ds.sessions
      FROM daily_stats ds
      JOIN apps a ON ds.app_id = a.id
      WHERE ds.date >= ?
      ORDER BY ds.date DESC, a.display_name ASC
    `, [dateStr]);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="metrics-${new Date().toISOString().split('T')[0]}.json"`);
    res.json({
      exportDate: new Date().toISOString(),
      period: `Last ${days} days`,
      recordCount: data.length,
      data
    });

    logger.info('Data exported to JSON', { rows: data.length, days });
  } catch (error) {
    logger.error('Error exporting JSON:', { error: error.message });
    res.status(500).json({ error: 'Failed to export data' });
  }
});

module.exports = router;
