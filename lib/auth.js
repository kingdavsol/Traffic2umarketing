const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const JWT_SECRET = 'earnhub-2025';
const hashPassword = (p) => bcrypt.hash(p, 10);
const comparePassword = (p, h) => bcrypt.compare(p, h);
const createToken = (id) => jwt.sign({userId: id}, JWT_SECRET, {expiresIn: '30d'});
const verifyToken = (t) => { try { return jwt.verify(t, JWT_SECRET); } catch { return null; } }
module.exports = { hashPassword, comparePassword, createToken, verifyToken };
