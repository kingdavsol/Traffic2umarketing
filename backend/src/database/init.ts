/**
 * Database initialization and migration runner
 * Runs all SQL migration files in the migrations directory
 */

import fs from 'fs';
import path from 'path';
import { query } from './connection';
import { logger } from '../config/logger';

export const runMigrations = async (): Promise<void> => {
  try {
    logger.info('Running database migrations...');

    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ensure migrations run in order

    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      logger.info(`Running migration: ${file}`);
      await query(sql);
      logger.info(`✓ Completed migration: ${file}`);
    }

    logger.info('✓ All migrations completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  }
};

export const initializeDatabase = async (): Promise<void> => {
  try {
    // Create migrations tracking table
    await query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Run migrations
    await runMigrations();

    logger.info('✓ Database initialized successfully');
  } catch (error) {
    logger.error('Database initialization failed:', error);
    throw error;
  }
};
