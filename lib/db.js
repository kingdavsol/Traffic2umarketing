const sqlite3 = require('sqlite3');
const path = require('path');
const db = new sqlite3.Database(path.join(process.cwd(), 'app.db'));
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT UNIQUE, password TEXT, name TEXT, age INTEGER, school TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
  db.run(`CREATE TABLE IF NOT EXISTS gigs (id INTEGER PRIMARY KEY, title TEXT, description TEXT, pay REAL, category TEXT, posted_by INTEGER, assigned_to INTEGER, status TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(posted_by) REFERENCES users(id))`);
  db.run(`CREATE TABLE IF NOT EXISTS earnings (id INTEGER PRIMARY KEY, user_id INTEGER UNIQUE, total REAL DEFAULT 0, available REAL DEFAULT 0, FOREIGN KEY(user_id) REFERENCES users(id))`);
});
module.exports = db;
