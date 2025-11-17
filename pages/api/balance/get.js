const db = require('../../../lib/db');
const { verifyToken } = require('../../../lib/auth');

export default function handler(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  db.get(
    'SELECT * FROM user_balances WHERE user_id = ?',
    [decoded.userId],
    (err, balance) => {
      if (err || !balance) {
        return res.status(404).json({ error: 'Balance not found' });
      }

      res.json(balance);
    }
  );
}
