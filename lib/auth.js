const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const JWT_SECRET = process.env.JWT_SECRET || 'skilltrade-2025';
const hashPassword = (pwd) => bcrypt.hash(pwd, 10);
const comparePassword = (pwd, hash) => bcrypt.compare(pwd, hash);
const createToken = (userId) => jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
const verifyToken = (token) => { try { return jwt.verify(token, JWT_SECRET); } catch { return null; } }
module.exports = { hashPassword, comparePassword, createToken, verifyToken };
