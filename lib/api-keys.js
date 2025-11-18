const crypto = require('crypto');
const db = require('./db');
const path = require('path');
const fs = require('fs');

const API_KEYS_FILE = path.join(__dirname, '../config/api-keys.json');

/**
 * Initialize API keys storage
 */
function initializeApiKeys() {
  const configDir = path.dirname(API_KEYS_FILE);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  if (!fs.existsSync(API_KEYS_FILE)) {
    fs.writeFileSync(API_KEYS_FILE, JSON.stringify({}, null, 2));
  }
}

/**
 * Generate a new API key
 * @returns {string} Generated API key
 */
function generateApiKey() {
  return 'tk_' + crypto.randomBytes(32).toString('hex');
}

/**
 * Hash API key for storage
 * @param {string} apiKey - API key to hash
 * @returns {string} Hashed key
 */
function hashApiKey(apiKey) {
  return crypto
    .createHash('sha256')
    .update(apiKey)
    .digest('hex');
}

/**
 * Create a new API key for an app
 * @param {string} appName - App name
 * @param {string} description - Key description
 * @returns {object} { apiKey, hash, createdAt }
 */
function createApiKey(appName, description = '') {
  const apiKey = generateApiKey();
  const hash = hashApiKey(apiKey);
  const now = new Date().toISOString();

  try {
    const keys = JSON.parse(fs.readFileSync(API_KEYS_FILE, 'utf8'));

    if (!keys[appName]) {
      keys[appName] = [];
    }

    keys[appName].push({
      hash,
      description,
      createdAt: now,
      lastUsed: null,
      usageCount: 0
    });

    fs.writeFileSync(API_KEYS_FILE, JSON.stringify(keys, null, 2));

    return {
      apiKey, // Return unhashed key only on creation
      hash,
      createdAt: now,
      description
    };
  } catch (error) {
    console.error('Error creating API key:', error);
    throw error;
  }
}

/**
 * Verify API key
 * @param {string} appName - App name
 * @param {string} apiKey - API key to verify
 * @returns {object} { valid, hash } or { valid: false }
 */
function verifyApiKey(appName, apiKey) {
  try {
    const keys = JSON.parse(fs.readFileSync(API_KEYS_FILE, 'utf8'));
    const appKeys = keys[appName];

    if (!appKeys || appKeys.length === 0) {
      return { valid: false };
    }

    const hash = hashApiKey(apiKey);
    const keyRecord = appKeys.find(k => k.hash === hash);

    if (!keyRecord) {
      return { valid: false };
    }

    // Update usage
    keyRecord.lastUsed = new Date().toISOString();
    keyRecord.usageCount = (keyRecord.usageCount || 0) + 1;
    fs.writeFileSync(API_KEYS_FILE, JSON.stringify(keys, null, 2));

    return {
      valid: true,
      hash,
      usageCount: keyRecord.usageCount
    };
  } catch (error) {
    console.error('Error verifying API key:', error);
    return { valid: false };
  }
}

/**
 * Get all API keys for an app (hashed, don't expose raw keys)
 * @param {string} appName - App name
 * @returns {array} Array of key info (without raw keys)
 */
function getApiKeys(appName) {
  try {
    const keys = JSON.parse(fs.readFileSync(API_KEYS_FILE, 'utf8'));
    const appKeys = keys[appName] || [];

    return appKeys.map(k => ({
      hash: k.hash.substring(0, 8) + '...', // Partial hash
      description: k.description,
      createdAt: k.createdAt,
      lastUsed: k.lastUsed,
      usageCount: k.usageCount
    }));
  } catch (error) {
    console.error('Error getting API keys:', error);
    return [];
  }
}

/**
 * Revoke API key
 * @param {string} appName - App name
 * @param {string} keyHash - Hash of key to revoke
 * @returns {boolean} Success
 */
function revokeApiKey(appName, keyHash) {
  try {
    const keys = JSON.parse(fs.readFileSync(API_KEYS_FILE, 'utf8'));

    if (!keys[appName]) {
      return false;
    }

    const initialLength = keys[appName].length;
    keys[appName] = keys[appName].filter(k => k.hash !== keyHash);

    if (keys[appName].length === initialLength) {
      return false; // Key not found
    }

    if (keys[appName].length === 0) {
      delete keys[appName];
    }

    fs.writeFileSync(API_KEYS_FILE, JSON.stringify(keys, null, 2));
    return true;
  } catch (error) {
    console.error('Error revoking API key:', error);
    return false;
  }
}

module.exports = {
  initializeApiKeys,
  generateApiKey,
  hashApiKey,
  createApiKey,
  verifyApiKey,
  getApiKeys,
  revokeApiKey
};
