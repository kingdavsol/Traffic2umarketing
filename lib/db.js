const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/monitoring.db');

let db = null;

const Database = {
  init() {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('Database connected at', DB_PATH);
        this.createTables();
      }
    });
  },

  createTables() {
    const queries = [
      // Apps table
      `CREATE TABLE IF NOT EXISTS apps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        display_name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Metrics table
      `CREATE TABLE IF NOT EXISTS metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        app_id INTEGER NOT NULL,
        metric_type TEXT NOT NULL,
        metric_value REAL NOT NULL,
        metric_date DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (app_id) REFERENCES apps(id),
        UNIQUE(app_id, metric_type, metric_date)
      )`,

      // Daily stats table
      `CREATE TABLE IF NOT EXISTS daily_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        app_id INTEGER NOT NULL,
        date DATE NOT NULL,
        users INTEGER DEFAULT 0,
        active_users INTEGER DEFAULT 0,
        downloads INTEGER DEFAULT 0,
        revenue REAL DEFAULT 0,
        ad_impressions INTEGER DEFAULT 0,
        ad_clicks INTEGER DEFAULT 0,
        sessions INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (app_id) REFERENCES apps(id),
        UNIQUE(app_id, date)
      )`,

      // Custom metrics table (flexible for different metrics)
      `CREATE TABLE IF NOT EXISTS custom_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        app_id INTEGER NOT NULL,
        metric_name TEXT NOT NULL,
        metric_value TEXT,
        date DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (app_id) REFERENCES apps(id)
      )`,

      // Create indexes for better query performance
      `CREATE INDEX IF NOT EXISTS idx_metrics_app_date ON metrics(app_id, metric_date)`,
      `CREATE INDEX IF NOT EXISTS idx_daily_stats_app_date ON daily_stats(app_id, date)`,
      `CREATE INDEX IF NOT EXISTS idx_custom_metrics_app_date ON custom_metrics(app_id, date)`
    ];

    let index = 0;
    const executeQuery = () => {
      if (index >= queries.length) {
        console.log('Database tables initialized successfully');
        return;
      }

      const query = queries[index];
      db.run(query, (err) => {
        if (err) {
          console.error('Error creating table:', err);
        }
        index++;
        executeQuery();
      });
    };

    executeQuery();
  },

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  },

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  },

  close() {
    return new Promise((resolve, reject) => {
      if (db) {
        db.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      } else {
        resolve();
      }
    });
  }
};

module.exports = Database;
