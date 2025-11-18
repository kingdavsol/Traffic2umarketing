const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gigstack', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'GigStack Running' }));

// Auth routes (stub)
app.post('/api/auth/register', (req, res) => {
  res.json({ message: 'Registration endpoint' });
});

app.post('/api/auth/login', (req, res) => {
  res.json({ message: 'Login endpoint' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`GigStack Backend on port ${PORT}`));
