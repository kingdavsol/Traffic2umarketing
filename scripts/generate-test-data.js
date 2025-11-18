#!/usr/bin/env node

/**
 * Generate test data for the monitoring dashboard
 * Usage: npm run generate-test-data
 */

const db = require('../lib/db');

// Sample apps based on user's 51 apps
const SAMPLE_APPS = [
  { name: 'snap-save', display: 'SnapSave' },
  { name: 'cash-flow-map', display: 'CashFlowMap' },
  { name: 'gig-stack', display: 'GigStack' },
  { name: 'vault-pay', display: 'VaultPay' },
  { name: 'bizbuys', display: 'BizBuys' },
  { name: 'earnhub', display: 'EarnHub' },
  { name: 'medisave', display: 'MediSave' },
  { name: 'neighborcash', display: 'NeighborCash' }
];

async function generateTestData() {
  console.log('🚀 Generating test data for monitoring dashboard...\n');

  try {
    db.init();

    // Generate 30 days of data
    const days = 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let recordsCreated = 0;

    for (let d = 0; d < days; d++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + d);
      const dateStr = date.toISOString().split('T')[0];

      for (const app of SAMPLE_APPS) {
        // Register app
        let appRecord = await db.get('SELECT id FROM apps WHERE name = ?', [app.name]);
        if (!appRecord) {
          await db.run('INSERT INTO apps (name, display_name) VALUES (?, ?)',
            [app.name, app.display]);
          appRecord = await db.get('SELECT id FROM apps WHERE name = ?', [app.name]);
        }

        // Generate realistic data with some variation
        const baseUsers = Math.floor(Math.random() * 5000) + 500;
        const baseRevenue = Math.random() * 10000;

        // Add some trend
        const trend = 1 + (d / days) * 0.2; // Slight upward trend
        const variance = (Math.random() - 0.5) * 0.3; // Random variance

        const users = Math.floor(baseUsers * trend * (1 + variance));
        const activeUsers = Math.floor(users * (0.6 + Math.random() * 0.3));
        const downloads = Math.floor(Math.random() * 200);
        const revenue = Math.round(baseRevenue * trend * (1 + variance) * 100) / 100;
        const adImpressions = Math.floor(users * (10 + Math.random() * 10));
        const adClicks = Math.floor(adImpressions * (0.01 + Math.random() * 0.02));
        const sessions = Math.floor(users * (2 + Math.random() * 3));

        // Check if record exists
        let dayStats = await db.get(
          'SELECT id FROM daily_stats WHERE app_id = ? AND date = ?',
          [appRecord.id, dateStr]
        );

        if (!dayStats) {
          await db.run(
            `INSERT INTO daily_stats
             (app_id, date, users, active_users, downloads, revenue,
              ad_impressions, ad_clicks, sessions)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [appRecord.id, dateStr, users, activeUsers, downloads, revenue,
             adImpressions, adClicks, sessions]
          );
          recordsCreated++;
        }
      }
    }

    console.log(`✅ Successfully generated test data!`);
    console.log(`📊 Created ${recordsCreated} records across ${SAMPLE_APPS.length} apps`);
    console.log(`📅 Data range: ${days} days\n`);
    console.log('📈 Visit the dashboard to see the test data:');
    console.log('   URL: http://localhost:3000/dashboard\n');
  } catch (error) {
    console.error('❌ Error generating test data:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

generateTestData();
