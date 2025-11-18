const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '50mb' }));

// Database Models
const userSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  phone: String,
  password: { type: String, required: true },
  firstName: String,
  lastName: String,
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  savingsGoal: Number,
  monthlyIncome: Number,
  currency: { type: String, default: 'USD' }
});

const savingsSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  userId: { type: String, required: true },
  amount: Number,
  type: { type: String, enum: ['roundup', 'manual', 'recurring'], default: 'manual' },
  description: String,
  date: { type: Date, default: Date.now },
  month: String,
  year: Number
});

const goalSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  userId: { type: String, required: true },
  title: String,
  targetAmount: Number,
  currentAmount: { type: Number, default: 0 },
  deadline: Date,
  category: String,
  progress: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const achievementSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  userId: { type: String, required: true },
  type: String,
  title: String,
  description: String,
  icon: String,
  points: Number,
  unlockedAt: { type: Date, default: Date.now }
});

const adSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  userId: { type: String, required: true },
  type: { type: String, enum: ['banner', 'interstitial', 'rewarded'] },
  adNetwork: { type: String, default: 'admob' },
  placement: String,
  viewedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Savings = mongoose.model('Savings', savingsSchema);
const Goal = mongoose.model('Goal', goalSchema);
const Achievement = mongoose.model('Achievement', achievementSchema);
const AdView = mongoose.model('AdView', adSchema);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/snapsave', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).catch(err => console.error('MongoDB Error:', err));

// Routes
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    const verificationToken = uuidv4();

    const user = new User({
      id: userId,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      emailVerificationToken: verificationToken,
      emailVerificationExpire: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    await user.save();

    const verificationLink = `${process.env.FRONTEND_URL}/verify/${verificationToken}`;
    await emailTransporter.sendMail({
      to: email,
      subject: 'SnapSave - Verify Your Email',
      html: `<h1>Welcome to SnapSave!</h1><p>Click <a href="${verificationLink}">here</a> to verify your email. Link expires in 24 hours.</p>`
    });

    res.status(201).json({
      message: 'Registration successful. Check your email to verify.',
      userId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret-key', { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, firstName: user.firstName } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpire = null;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Middleware to verify JWT
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET || 'secret-key', (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.userId = decoded.userId;
    next();
  });
};

// Savings Routes
app.post('/api/savings/add', authMiddleware, async (req, res) => {
  try {
    const { amount, type, description } = req.body;
    const savingsId = uuidv4();
    const now = new Date();

    const saving = new Savings({
      id: savingsId,
      userId: req.userId,
      amount,
      type,
      description,
      month: now.toLocaleString('default', { month: 'long' }),
      year: now.getFullYear()
    });

    await saving.save();

    // Check if achievement unlocked
    const totalSavings = await Savings.aggregate([
      { $match: { userId: req.userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.status(201).json({ savings: saving, totalSavings: totalSavings[0]?.total || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/savings/monthly', authMiddleware, async (req, res) => {
  try {
    const { month, year } = req.query;
    const savings = await Savings.find({
      userId: req.userId,
      month,
      year: parseInt(year)
    });

    const total = savings.reduce((sum, s) => sum + s.amount, 0);
    res.json({ savings, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/savings/analytics', authMiddleware, async (req, res) => {
  try {
    const totalSaved = await Savings.aggregate([
      { $match: { userId: req.userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const byType = await Savings.aggregate([
      { $match: { userId: req.userId } },
      { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    const monthlyData = await Savings.aggregate([
      { $match: { userId: req.userId } },
      { $group: { _id: { month: '$month', year: '$year' }, total: { $sum: '$amount' } } }
    ]);

    res.json({
      totalSaved: totalSaved[0]?.total || 0,
      byType,
      monthlyData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Goals Routes
app.post('/api/goals/create', authMiddleware, async (req, res) => {
  try {
    const { title, targetAmount, deadline, category } = req.body;
    const goalId = uuidv4();

    const goal = new Goal({
      id: goalId,
      userId: req.userId,
      title,
      targetAmount,
      deadline,
      category
    });

    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/goals/list', authMiddleware, async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.userId });

    const goalsWithProgress = await Promise.all(goals.map(async (goal) => {
      const savings = await Savings.find({ userId: req.userId });
      const totalSaved = savings.reduce((sum, s) => sum + s.amount, 0);
      return {
        ...goal.toObject(),
        progress: (totalSaved / goal.targetAmount) * 100
      };
    }));

    res.json(goalsWithProgress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Achievements Routes
app.get('/api/achievements/list', authMiddleware, async (req, res) => {
  try {
    const achievements = await Achievement.find({ userId: req.userId });
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/achievements/unlock', authMiddleware, async (req, res) => {
  try {
    const { type, title, description, points } = req.body;
    const achievementId = uuidv4();

    const achievement = new Achievement({
      id: achievementId,
      userId: req.userId,
      type,
      title,
      description,
      points
    });

    await achievement.save();
    res.status(201).json(achievement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ad Tracking Routes
app.post('/api/ads/track', authMiddleware, async (req, res) => {
  try {
    const { type, placement } = req.body;
    const adId = uuidv4();

    const ad = new AdView({
      id: adId,
      userId: req.userId,
      type,
      placement
    });

    await ad.save();
    res.status(201).json(ad);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User Profile Routes
app.get('/api/user/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ id: req.userId }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/user/profile', authMiddleware, async (req, res) => {
  try {
    const { firstName, lastName, savingsGoal, monthlyIncome, currency } = req.body;
    const user = await User.findOneAndUpdate(
      { id: req.userId },
      { firstName, lastName, savingsGoal, monthlyIncome, currency, updatedAt: new Date() },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'SnapSave Backend Running' }));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`SnapSave Backend on port ${PORT}`));
