const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const WorkflowSchema = new mongoose.Schema({
  id: { type: String, unique: true, default: () => uuidv4() },
  userId: String,
  data: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Workflow = mongoose.model('Workflow', WorkflowSchema);

const TriggerSchema = new mongoose.Schema({
  id: { type: String, unique: true, default: () => uuidv4() },
  userId: String,
  data: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Trigger = mongoose.model('Trigger', TriggerSchema);

const ActionSchema = new mongoose.Schema({
  id: { type: String, unique: true, default: () => uuidv4() },
  userId: String,
  data: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Action = mongoose.model('Action', ActionSchema);

const ExecutionSchema = new mongoose.Schema({
  id: { type: String, unique: true, default: () => uuidv4() },
  userId: String,
  data: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Execution = mongoose.model('Execution', ExecutionSchema);

module.exports = {
  Workflow, Trigger, Action, Execution
};
