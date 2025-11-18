const express = require('express');
const router = express.Router();
const db = require('../lib/db');

// GET /dashboard - Main dashboard page
router.get('/', (req, res) => {
  res.sendFile(require('path').join(__dirname, '../public/dashboard.html'));
});

// GET /dashboard/api/overview - Get overall statistics
router.get('/api/overview', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Get all apps count
    const appsCount = await db.get('SELECT COUNT(*) as count FROM apps');

    // Get today's stats across all apps
    const todayStats = await db.get(`
      SELECT
        COUNT(DISTINCT app_id) as active_apps,
        COALESCE(SUM(users), 0) as total_users,
        COALESCE(SUM(active_users), 0) as total_active_users,
        COALESCE(SUM(downloads), 0) as total_downloads,
        COALESCE(SUM(revenue), 0) as total_revenue,
        COALESCE(SUM(ad_impressions), 0) as total_ad_impressions,
        COALESCE(SUM(ad_clicks), 0) as total_ad_clicks,
        COALESCE(SUM(sessions), 0) as total_sessions
      FROM daily_stats
      WHERE date = ?
    `, [today]);

    // Get 7-day average
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysDate = sevenDaysAgo.toISOString().split('T')[0];

    const sevenDayAvg = await db.get(`
      SELECT
        ROUND(AVG(users), 0) as avg_users,
        ROUND(AVG(active_users), 0) as avg_active_users,
        ROUND(AVG(downloads), 0) as avg_downloads,
        ROUND(AVG(revenue), 2) as avg_revenue
      FROM daily_stats
      WHERE date >= ? AND date <= ?
    `, [sevenDaysDate, today]);

    const overview = {
      totalApps: appsCount.count,
      today: todayStats || {},
      sevenDayAvg: sevenDayAvg || {},
      timestamp: new Date().toISOString()
    };

    res.json(overview);
  } catch (error) {
    console.error('Error fetching overview:', error);
    res.status(500).json({ error: 'Failed to fetch overview' });
  }
});

// GET /dashboard/api/apps - Get all apps with their latest stats
router.get('/api/apps', async (req, res) => {
  try {
    const apps = await db.all(`
      SELECT
        a.id,
        a.name,
        a.display_name,
        a.created_at,
        COALESCE(ds.date, 'Never') as last_update,
        COALESCE(ds.users, 0) as users,
        COALESCE(ds.active_users, 0) as active_users,
        COALESCE(ds.downloads, 0) as downloads,
        COALESCE(ds.revenue, 0) as revenue,
        COALESCE(ds.ad_impressions, 0) as ad_impressions,
        COALESCE(ds.ad_clicks, 0) as ad_clicks,
        COALESCE(ds.sessions, 0) as sessions
      FROM apps a
      LEFT JOIN daily_stats ds ON a.id = ds.app_id
        AND ds.date = (SELECT MAX(date) FROM daily_stats WHERE app_id = a.id)
      ORDER BY a.name ASC
    `);

    res.json(apps);
  } catch (error) {
    console.error('Error fetching apps:', error);
    res.status(500).json({ error: 'Failed to fetch apps' });
  }
});

// GET /dashboard/api/apps/:appId - Get detailed stats for an app
router.get('/api/apps/:appId', async (req, res) => {
  try {
    const { appId } = req.params;
    const { days = 30 } = req.query;

    const app = await db.get('SELECT * FROM apps WHERE id = ?', [appId]);
    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    const dateStr = startDate.toISOString().split('T')[0];

    const stats = await db.all(`
      SELECT
        date,
        users,
        active_users,
        downloads,
        revenue,
        ad_impressions,
        ad_clicks,
        sessions
      FROM daily_stats
      WHERE app_id = ? AND date >= ?
      ORDER BY date ASC
    `, [appId, dateStr]);

    const summary = {
      totalUsers: 0,
      totalDownloads: 0,
      totalRevenue: 0,
      totalSessions: 0,
      avgDailyUsers: 0,
      avgDailyDownloads: 0
    };

    if (stats.length > 0) {
      summary.totalUsers = stats.reduce((sum, s) => sum + (s.users || 0), 0);
      summary.totalDownloads = stats.reduce((sum, s) => sum + (s.downloads || 0), 0);
      summary.totalRevenue = stats.reduce((sum, s) => sum + (s.revenue || 0), 0);
      summary.totalSessions = stats.reduce((sum, s) => sum + (s.sessions || 0), 0);
      summary.avgDailyUsers = Math.round(summary.totalUsers / stats.length);
      summary.avgDailyDownloads = Math.round(summary.totalDownloads / stats.length);
    }

    res.json({
      app,
      stats,
      summary
    });
  } catch (error) {
    console.error('Error fetching app details:', error);
    res.status(500).json({ error: 'Failed to fetch app details' });
  }
});

// GET /dashboard/api/top-apps - Get top performing apps
router.get('/api/top-apps', async (req, res) => {
  try {
    const { metric = 'revenue', days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    const dateStr = startDate.toISOString().split('T')[0];

    const metricField = metric === 'revenue' ? 'revenue' : metric === 'downloads' ? 'downloads' : 'users';

    const topApps = await db.all(`
      SELECT
        a.id,
        a.name,
        a.display_name,
        SUM(${metricField}) as total_metric,
        COUNT(ds.date) as days_reported
      FROM apps a
      LEFT JOIN daily_stats ds ON a.id = ds.app_id AND ds.date >= ?
      GROUP BY a.id
      ORDER BY total_metric DESC
      LIMIT 10
    `, [dateStr]);

    res.json(topApps);
  } catch (error) {
    console.error('Error fetching top apps:', error);
    res.status(500).json({ error: 'Failed to fetch top apps' });
  }
});

// GET /dashboard/api/stats/timeline - Get timeline data for all apps
router.get('/api/stats/timeline', async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    const dateStr = startDate.toISOString().split('T')[0];

    const timeline = await db.all(`
      SELECT
        date,
        SUM(users) as total_users,
        SUM(active_users) as total_active_users,
        SUM(downloads) as total_downloads,
        SUM(revenue) as total_revenue,
        SUM(ad_impressions) as total_ad_impressions,
        COUNT(DISTINCT app_id) as active_apps
      FROM daily_stats
      WHERE date >= ?
      GROUP BY date
      ORDER BY date ASC
    `, [dateStr]);

    res.json(timeline);
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({ error: 'Failed to fetch timeline' });
  }
});

module.exports = router;
