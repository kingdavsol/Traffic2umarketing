const db = require('../../../lib/db');
const { hashPassword, createToken } = require('../../../lib/auth');

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  hashPassword(password).then((hashedPassword) => {
    const stmt = db.prepare(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)'
    );

    stmt.run([email, hashedPassword, name], function(err) {
      if (err) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      const token = createToken(this.lastID);
      const userId = this.lastID;

      // Create initial balance
      db.run(
        'INSERT INTO user_balances (user_id, total_earned, available_balance) VALUES (?, 0, 0)',
        [userId]
      );

      res.status(201).json({
        success: true,
        token,
        user: { id: userId, email, name },
      });
    });
  });
}
