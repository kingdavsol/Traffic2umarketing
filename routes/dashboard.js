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

// GET /dashboard/api/analysis/top-bottom - Get top 5 and bottom 5 performers
router.get('/api/analysis/top-bottom', async (req, res) => {
  try {
    const { metric = 'revenue', days = 30 } = req.query;
    const numApps = parseInt(req.query.limit) || 5;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    const dateStr = startDate.toISOString().split('T')[0];

    const metricField = metric === 'revenue' ? 'revenue' :
                       metric === 'downloads' ? 'downloads' :
                       metric === 'users' ? 'users' : 'revenue';

    const metricLabel = metric.charAt(0).toUpperCase() + metric.slice(1);

    // Get top performers
    const topApps = await db.all(`
      SELECT
        a.id,
        a.display_name,
        ROUND(SUM(${metricField}), 2) as total_metric,
        ROUND(AVG(${metricField}), 2) as avg_metric,
        COUNT(ds.date) as days_reported
      FROM apps a
      LEFT JOIN daily_stats ds ON a.id = ds.app_id AND ds.date >= ?
      GROUP BY a.id
      HAVING SUM(${metricField}) > 0
      ORDER BY total_metric DESC
      LIMIT ?
    `, [dateStr, numApps]);

    // Get bottom performers (apps that have data but low metrics)
    const bottomApps = await db.all(`
      SELECT
        a.id,
        a.display_name,
        ROUND(SUM(${metricField}), 2) as total_metric,
        ROUND(AVG(${metricField}), 2) as avg_metric,
        COUNT(ds.date) as days_reported
      FROM apps a
      LEFT JOIN daily_stats ds ON a.id = ds.app_id AND ds.date >= ?
      GROUP BY a.id
      HAVING COUNT(ds.date) > 0
      ORDER BY total_metric ASC
      LIMIT ?
    `, [dateStr, numApps]);

    res.json({
      metric: metricLabel,
      period: `Last ${days} days`,
      top: topApps,
      bottom: bottomApps
    });
  } catch (error) {
    console.error('Error fetching top/bottom apps:', error);
    res.status(500).json({ error: 'Failed to fetch analysis' });
  }
});

// GET /dashboard/api/analysis/growth - Get growth metrics for apps
router.get('/api/analysis/growth', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const days = parseInt(req.query.days) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const dateStr = startDate.toISOString().split('T')[0];

    // Calculate growth rates for each app
    const growth = await db.all(`
      SELECT
        a.id,
        a.display_name,
        -- First day stats
        (SELECT users FROM daily_stats WHERE app_id = a.id AND date >= ? ORDER BY date ASC LIMIT 1) as first_day_users,
        (SELECT revenue FROM daily_stats WHERE app_id = a.id AND date >= ? ORDER BY date ASC LIMIT 1) as first_day_revenue,
        (SELECT downloads FROM daily_stats WHERE app_id = a.id AND date >= ? ORDER BY date ASC LIMIT 1) as first_day_downloads,
        -- Last day stats
        (SELECT users FROM daily_stats WHERE app_id = a.id AND date <= ? ORDER BY date DESC LIMIT 1) as last_day_users,
        (SELECT revenue FROM daily_stats WHERE app_id = a.id AND date <= ? ORDER BY date DESC LIMIT 1) as last_day_revenue,
        (SELECT downloads FROM daily_stats WHERE app_id = a.id AND date <= ? ORDER BY date DESC LIMIT 1) as last_day_downloads,
        COUNT(DISTINCT ds.date) as days_reported
      FROM apps a
      LEFT JOIN daily_stats ds ON a.id = ds.app_id AND ds.date >= ? AND ds.date <= ?
      GROUP BY a.id
      HAVING days_reported > 0
      ORDER BY a.display_name ASC
    `, [dateStr, dateStr, dateStr, today, today, today, dateStr, today]);

    // Calculate growth percentages
    const growthAnalysis = growth.map(app => {
      const userGrowth = app.first_day_users > 0 ?
        (((app.last_day_users - app.first_day_users) / app.first_day_users) * 100).toFixed(2) : 0;
      const revenueGrowth = app.first_day_revenue > 0 ?
        (((app.last_day_revenue - app.first_day_revenue) / app.first_day_revenue) * 100).toFixed(2) : 0;
      const downloadGrowth = app.first_day_downloads > 0 ?
        (((app.last_day_downloads - app.first_day_downloads) / app.first_day_downloads) * 100).toFixed(2) : 0;

      return {
        id: app.id,
        displayName: app.display_name,
        daysReported: app.days_reported,
        users: {
          start: app.first_day_users || 0,
          end: app.last_day_users || 0,
          growth: parseFloat(userGrowth)
        },
        revenue: {
          start: app.first_day_revenue || 0,
          end: app.last_day_revenue || 0,
          growth: parseFloat(revenueGrowth)
        },
        downloads: {
          start: app.first_day_downloads || 0,
          end: app.last_day_downloads || 0,
          growth: parseFloat(downloadGrowth)
        }
      };
    });

    // Sort by overall growth potential
    growthAnalysis.sort((a, b) => {
      const aScore = (a.users.growth + a.revenue.growth + a.downloads.growth) / 3;
      const bScore = (b.users.growth + b.revenue.growth + b.downloads.growth) / 3;
      return bScore - aScore;
    });

    res.json({
      period: `Last ${days} days`,
      growthAnalysis
    });
  } catch (error) {
    console.error('Error fetching growth analysis:', error);
    res.status(500).json({ error: 'Failed to fetch growth analysis' });
  }
});

// GET /dashboard/api/analysis/performance-summary - Get key performance indicators
router.get('/api/analysis/performance-summary', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const today = new Date().toISOString().split('T')[0];

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const dateStr = startDate.toISOString().split('T')[0];

    // Overall platform metrics
    const platformMetrics = await db.get(`
      SELECT
        COUNT(DISTINCT app_id) as active_apps,
        ROUND(AVG(users), 0) as avg_daily_users,
        ROUND(AVG(downloads), 0) as avg_daily_downloads,
        ROUND(AVG(revenue), 2) as avg_daily_revenue,
        ROUND(AVG(sessions), 0) as avg_daily_sessions,
        SUM(revenue) as total_revenue,
        SUM(downloads) as total_downloads,
        SUM(users) as total_users
      FROM daily_stats
      WHERE date >= ? AND date <= ?
    `, [dateStr, today]);

    // Best performing app by revenue
    const topRevenueApp = await db.get(`
      SELECT a.display_name, SUM(ds.revenue) as total_revenue
      FROM apps a
      LEFT JOIN daily_stats ds ON a.id = ds.app_id AND ds.date >= ? AND ds.date <= ?
      GROUP BY a.id
      ORDER BY total_revenue DESC
      LIMIT 1
    `, [dateStr, today]);

    // Best performing app by users
    const topUserApp = await db.get(`
      SELECT a.display_name, SUM(ds.users) as total_users
      FROM apps a
      LEFT JOIN daily_stats ds ON a.id = ds.app_id AND ds.date >= ? AND ds.date <= ?
      GROUP BY a.id
      ORDER BY total_users DESC
      LIMIT 1
    `, [dateStr, today]);

    // Best performing app by downloads
    const topDownloadApp = await db.get(`
      SELECT a.display_name, SUM(ds.downloads) as total_downloads
      FROM apps a
      LEFT JOIN daily_stats ds ON a.id = ds.app_id AND ds.date >= ? AND ds.date <= ?
      GROUP BY a.id
      ORDER BY total_downloads DESC
      LIMIT 1
    `, [dateStr, today]);

    // Engagement metrics
    const engagementRate = platformMetrics.active_apps > 0 ?
      ((platformMetrics.avg_daily_sessions / platformMetrics.avg_daily_users) * 100).toFixed(2) : 0;

    const adClickRate = platformMetrics.active_apps > 0 ? await db.get(`
      SELECT
        ROUND((SUM(ad_clicks) / SUM(ad_impressions)) * 100, 2) as ctr
      FROM daily_stats
      WHERE date >= ? AND date <= ? AND ad_impressions > 0
    `, [dateStr, today]) : { ctr: 0 };

    const summary = {
      period: `Last ${days} days`,
      platformMetrics: {
        activeApps: platformMetrics.active_apps || 0,
        avgDailyUsers: platformMetrics.avg_daily_users || 0,
        avgDailyDownloads: platformMetrics.avg_daily_downloads || 0,
        avgDailyRevenue: platformMetrics.avg_daily_revenue || 0,
        avgDailySessions: platformMetrics.avg_daily_sessions || 0,
        totalRevenue: platformMetrics.total_revenue || 0,
        totalDownloads: platformMetrics.total_downloads || 0,
        engagementRate: parseFloat(engagementRate),
        adClickRate: parseFloat(adClickRate.ctr || 0)
      },
      topPerformers: {
        byRevenue: topRevenueApp?.display_name || 'N/A',
        byUsers: topUserApp?.display_name || 'N/A',
        byDownloads: topDownloadApp?.display_name || 'N/A'
      }
    };

    res.json(summary);
  } catch (error) {
    console.error('Error fetching performance summary:', error);
    res.status(500).json({ error: 'Failed to fetch performance summary' });
  }
});

module.exports = router;
