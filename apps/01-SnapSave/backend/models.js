const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const SavingSchema = new mongoose.Schema({
  id: { type: String, unique: true, default: () => uuidv4() },
  userId: String,
  data: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Saving = mongoose.model('Saving', SavingSchema);

const GoalSchema = new mongoose.Schema({
  id: { type: String, unique: true, default: () => uuidv4() },
  userId: String,
  data: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Goal = mongoose.model('Goal', GoalSchema);

const AchievementSchema = new mongoose.Schema({
  id: { type: String, unique: true, default: () => uuidv4() },
  userId: String,
  data: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Achievement = mongoose.model('Achievement', AchievementSchema);

const MonthlyStatsSchema = new mongoose.Schema({
  id: { type: String, unique: true, default: () => uuidv4() },
  userId: String,
  data: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const MonthlyStats = mongoose.model('MonthlyStats', MonthlyStatsSchema);

module.exports = {
  Saving, Goal, Achievement, MonthlyStats
};
