const db = require('../../../lib/db');
const { hashPassword, createToken } = require('../../../lib/auth');
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error: 'Not allowed'});
  const { email, password, name } = req.body;
  try {
    const pwd = await hashPassword(password);
    db.run('INSERT INTO users (email, password, name) VALUES (?, ?, ?)', [email, pwd, name], function(err) {
      if (err) return res.status(400).json({error: 'Email exists'});
      const token = createToken(this.lastID);
      db.run('INSERT INTO user_balance (user_id, total, available) VALUES (?, 0, 0)', [this.lastID]);
      res.status(201).json({ success: true, token });
    });
  } catch (err) {
    res.status(500).json({error: 'Error'});
  }
}
