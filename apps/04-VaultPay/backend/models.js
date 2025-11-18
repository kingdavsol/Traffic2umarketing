const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const WalletSchema = new mongoose.Schema({
  id: { type: String, unique: true, default: () => uuidv4() },
  userId: String,
  data: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Wallet = mongoose.model('Wallet', WalletSchema);

const AssetSchema = new mongoose.Schema({
  id: { type: String, unique: true, default: () => uuidv4() },
  userId: String,
  data: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Asset = mongoose.model('Asset', AssetSchema);

const TransactionSchema = new mongoose.Schema({
  id: { type: String, unique: true, default: () => uuidv4() },
  userId: String,
  data: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', TransactionSchema);

const PriceSchema = new mongoose.Schema({
  id: { type: String, unique: true, default: () => uuidv4() },
  userId: String,
  data: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Price = mongoose.model('Price', PriceSchema);

module.exports = {
  Wallet, Asset, Transaction, Price
};
