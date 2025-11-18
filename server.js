const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const basicAuth = require('express-basic-auth');
const path = require('path');
require('dotenv').config();

const db = require('./lib/db');
const api = require('./routes/api');
const dashboard = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Basic authentication for dashboard
const auth = basicAuth({
  users: { [ADMIN_USERNAME]: ADMIN_PASSWORD },
  challenge: true,
  realm: 'Traffic2u Monitoring Dashboard'
});

// Initialize database
db.init();

// API routes (no auth required for metrics collection)
app.use('/api', api);

// Dashboard routes (auth required)
app.use('/dashboard', auth, dashboard);

// Redirect root to dashboard
app.get('/', (req, res) => {
  res.redirect('/dashboard');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Traffic2u Monitoring Dashboard running on http://localhost:${PORT}`);
  console.log(`Admin Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`Username: ${ADMIN_USERNAME}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});
