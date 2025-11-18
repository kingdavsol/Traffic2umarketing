const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const apiRoutes = require('./routes');

const app = express();

app.use(helmet());
app.use(morgan('combined'));
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/16-puzzlequest', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('16-PuzzleQuest DB connected')).catch(err => console.error('DB Error:', err));

// Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`16-PuzzleQuest Backend on port ${PORT}`));
