const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(process.cwd(), 'skilltrade.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT UNIQUE, password TEXT, name TEXT, type TEXT, license TEXT, insurance TEXT, rating REAL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
  db.run(`CREATE TABLE IF NOT EXISTS jobs (id INTEGER PRIMARY KEY, title TEXT, description TEXT, category TEXT, budget REAL, posted_by INTEGER, assigned_to INTEGER, status TEXT, location TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(posted_by) REFERENCES users(id))`);
  db.run(`CREATE TABLE IF NOT EXISTS applications (id INTEGER PRIMARY KEY, job_id INTEGER, contractor_id INTEGER, bid REAL, message TEXT, status TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(job_id) REFERENCES jobs(id), FOREIGN KEY(contractor_id) REFERENCES users(id))`);
  db.run(`CREATE TABLE IF NOT EXISTS earnings (id INTEGER PRIMARY KEY, user_id INTEGER UNIQUE, total_earned REAL DEFAULT 0, total_paid REAL DEFAULT 0, available REAL DEFAULT 0, FOREIGN KEY(user_id) REFERENCES users(id))`);
});

module.exports = db;
