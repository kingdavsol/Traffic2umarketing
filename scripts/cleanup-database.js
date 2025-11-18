#!/usr/bin/env node

/**
 * Clean up old data from database
 * Implements data retention policy: Keep 1 year of data, archive older records
 * Usage: npm run cleanup-database
 */

const db = require('../lib/db');
const fs = require('fs');
const path = require('path');

const RETENTION_DAYS = 365; // Keep 1 year of data
const BACKUP_DIR = path.join(__dirname, '../data/archived');

async function cleanupDatabase() {
  console.log('🧹 Starting database cleanup...\n');

  try {
    db.init();

    // Ensure backup directory exists
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

    console.log(`📅 Data retention policy: Keep ${RETENTION_DAYS} days`);
    console.log(`🗓️  Cutoff date: ${cutoffDateStr}`);
    console.log(`📦 Will delete data older than: ${cutoffDateStr}\n`);

    // Get records to be deleted
    const oldRecords = await db.all(
      'SELECT COUNT(*) as count FROM daily_stats WHERE date < ?',
      [cutoffDateStr]
    );

    const recordCount = oldRecords[0]?.count || 0;

    if (recordCount === 0) {
      console.log('✅ No old data to clean up. Database is within retention policy.\n');
      process.exit(0);
    }

    // Backup old data before deletion
    console.log(`💾 Backing up ${recordCount} old records...\n`);

    const oldData = await db.all(
      `SELECT ds.*, a.name as app_name FROM daily_stats ds
       JOIN apps a ON ds.app_id = a.id
       WHERE ds.date < ?
       ORDER BY ds.date DESC`,
      [cutoffDateStr]
    );

    if (oldData.length > 0) {
      const backupFile = path.join(
        BACKUP_DIR,
        `backup-${cutoffDateStr}.json`
      );

      const backupData = {
        backupDate: new Date().toISOString(),
        retentionDate: cutoffDateStr,
        recordCount: oldData.length,
        data: oldData
      };

      fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
      console.log(`✅ Backup created: ${backupFile}\n`);
    }

    // Delete old records
    console.log(`🗑️  Deleting old records from database...\n`);

    const result = await db.run(
      'DELETE FROM daily_stats WHERE date < ?',
      [cutoffDateStr]
    );

    console.log(`✅ Successfully deleted ${result.changes} records from database\n`);

    // Show database statistics
    const stats = await db.get(`
      SELECT
        (SELECT COUNT(*) FROM apps) as total_apps,
        (SELECT COUNT(*) FROM daily_stats) as total_records,
        (SELECT MIN(date) FROM daily_stats) as oldest_date,
        (SELECT MAX(date) FROM daily_stats) as newest_date,
        ROUND((SELECT page_count * page_size / 1024.0 / 1024.0
               FROM pragma_page_count(), pragma_page_size()), 2) as db_size_mb
    `);

    console.log('📊 Database Statistics:');
    console.log(`  Total apps: ${stats.total_apps}`);
    console.log(`  Total records: ${stats.total_records}`);
    console.log(`  Date range: ${stats.oldest_date} to ${stats.newest_date}`);
    console.log(`  Database size: ${stats.db_size_mb} MB\n`);

    // Show backups
    console.log('📦 Existing Backups:');
    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith('.json'))
      .sort()
      .reverse();

    if (backups.length === 0) {
      console.log('  (no backups yet)\n');
    } else {
      backups.forEach(backup => {
        const fullPath = path.join(BACKUP_DIR, backup);
        const stats = fs.statSync(fullPath);
        const sizeKB = Math.round(stats.size / 1024);
        console.log(`  ${backup} (${sizeKB} KB)`);
      });
      console.log('');
    }

    console.log('✅ Cleanup completed successfully!\n');
    console.log('💡 Tip: Run this cleanup script regularly (e.g., monthly via cron)\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

cleanupDatabase();
