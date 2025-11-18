const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const MessageSchema = new mongoose.Schema({
  id: { type: String, unique: true, default: () => uuidv4() },
  userId: String,
  data: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', MessageSchema);

const ConversationSchema = new mongoose.Schema({
  id: { type: String, unique: true, default: () => uuidv4() },
  userId: String,
  data: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Conversation = mongoose.model('Conversation', ConversationSchema);

const KeySchema = new mongoose.Schema({
  id: { type: String, unique: true, default: () => uuidv4() },
  userId: String,
  data: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Key = mongoose.model('Key', KeySchema);

const GroupChatSchema = new mongoose.Schema({
  id: { type: String, unique: true, default: () => uuidv4() },
  userId: String,
  data: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const GroupChat = mongoose.model('GroupChat', GroupChatSchema);

module.exports = {
  Message, Conversation, Key, GroupChat
};
