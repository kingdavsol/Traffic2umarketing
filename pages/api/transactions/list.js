const db = require('../../../lib/db');
const { verifyToken } = require('../../../lib/auth');

export default function handler(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  db.all(
    `SELECT t.*, p.name as provider_name FROM transactions t
     LEFT JOIN providers p ON t.provider_id = p.id
     WHERE t.user_id = ? ORDER BY t.created_at DESC LIMIT 50`,
    [decoded.userId],
    (err, transactions) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch transactions' });
      }

      res.json(transactions || []);
    }
  );
}
