const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(process.cwd(), 'medisave.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Initialize tables
const initializeDB = () => {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT,
        name TEXT,
        phone TEXT,
        insurance_provider TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Providers (pharmacies, clinics, etc.)
    db.run(`
      CREATE TABLE IF NOT EXISTS providers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        type TEXT,
        address TEXT,
        cashback_percent REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Transactions
    db.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        provider_id INTEGER,
        amount REAL,
        cashback_earned REAL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(provider_id) REFERENCES providers(id)
      )
    `);

    // User balances
    db.run(`
      CREATE TABLE IF NOT EXISTS user_balances (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE,
        total_earned REAL DEFAULT 0,
        total_redeemed REAL DEFAULT 0,
        available_balance REAL DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

    // Offers
    db.run(`
      CREATE TABLE IF NOT EXISTS offers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        provider_id INTEGER,
        title TEXT,
        description TEXT,
        cashback_percent REAL,
        max_cashback REAL,
        valid_until DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(provider_id) REFERENCES providers(id)
      )
    `);
  });
};

initializeDB();

module.exports = db;
