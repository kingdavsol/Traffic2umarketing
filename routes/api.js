const express = require('express');
const router = express.Router();
const db = require('../lib/db');

// Register or get app
async function getOrCreateApp(appName, displayName) {
  try {
    let app = await db.get('SELECT * FROM apps WHERE name = ?', [appName]);
    if (!app) {
      await db.run('INSERT INTO apps (name, display_name) VALUES (?, ?)',
        [appName, displayName || appName]);
      app = await db.get('SELECT * FROM apps WHERE name = ?', [appName]);
    }
    return app;
  } catch (error) {
    console.error('Error in getOrCreateApp:', error);
    throw error;
  }
}

// POST /api/metrics - Submit metrics for an app
router.post('/metrics', async (req, res) => {
  try {
    const { appName, displayName, date, metrics } = req.body;

    if (!appName || !metrics) {
      return res.status(400).json({ error: 'Missing required fields: appName, metrics' });
    }

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

    res.json({
      success: true,
      message: 'Metrics recorded',
      appId: app.id,
      appName: app.name
    });
  } catch (error) {
    console.error('Error recording metrics:', error);
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
    console.error('Error fetching summary:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

module.exports = router;
