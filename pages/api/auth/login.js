const db = require('../../../lib/db');
const { comparePassword, createToken } = require('../../../lib/auth');
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error: 'Not allowed'});
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (!user) return res.status(401).json({error: 'Invalid'});
    if (!await comparePassword(password, user.password)) return res.status(401).json({error: 'Invalid'});
    res.json({ success: true, token: createToken(user.id) });
  });
}
