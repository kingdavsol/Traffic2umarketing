const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const CycleSchema = new mongoose.Schema({
  id: { type: String, unique: true, default: () => uuidv4() },
  userId: String,
  data: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Cycle = mongoose.model('Cycle', CycleSchema);

const SymptomSchema = new mongoose.Schema({
  id: { type: String, unique: true, default: () => uuidv4() },
  userId: String,
  data: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Symptom = mongoose.model('Symptom', SymptomSchema);

const PredictionSchema = new mongoose.Schema({
  id: { type: String, unique: true, default: () => uuidv4() },
  userId: String,
  data: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Prediction = mongoose.model('Prediction', PredictionSchema);

const InsightSchema = new mongoose.Schema({
  id: { type: String, unique: true, default: () => uuidv4() },
  userId: String,
  data: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Insight = mongoose.model('Insight', InsightSchema);

module.exports = {
  Cycle, Symptom, Prediction, Insight
};
