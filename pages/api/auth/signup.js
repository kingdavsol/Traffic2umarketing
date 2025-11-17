const db = require('../../../lib/db');
const { hashPassword, createToken } = require('../../../lib/auth');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error: 'Method not allowed'});
  const { email, password, name, type } = req.body;
  if (!email || !password || !name) return res.status(400).json({error: 'Missing fields'});
  
  try {
    const hashedPassword = await hashPassword(password);
    db.run('INSERT INTO users (email, password, name, type) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, name, type || 'contractor'],
      function(err) {
        if (err) return res.status(400).json({error: 'Email exists'});
        const token = createToken(this.lastID);
        db.run('INSERT INTO earnings (user_id, total_earned, available) VALUES (?, 0, 0)', [this.lastID]);
        res.status(201).json({ success: true, token, user: { id: this.lastID, email, name } });
      }
    );
  } catch (err) {
    res.status(500).json({error: 'Server error'});
  }
}
