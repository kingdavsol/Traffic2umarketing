const db = require('../../../lib/db');
const { verifyToken } = require('../../../lib/auth');

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers.authorization?.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { provider_id, amount, description } = req.body;

  db.get(
    'SELECT cashback_percent FROM providers WHERE id = ?',
    [provider_id],
    (err, provider) => {
      if (err || !provider) {
        return res.status(404).json({ error: 'Provider not found' });
      }

      const cashback = amount * (provider.cashback_percent / 100);

      db.run(
        'INSERT INTO transactions (user_id, provider_id, amount, cashback_earned, description) VALUES (?, ?, ?, ?, ?)',
        [decoded.userId, provider_id, amount, cashback, description],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to create transaction' });
          }

          // Update user balance
          db.run(
            `UPDATE user_balances SET total_earned = total_earned + ?,
             available_balance = available_balance + ? WHERE user_id = ?`,
            [cashback, cashback, decoded.userId]
          );

          res.status(201).json({
            success: true,
            transaction: {
              id: this.lastID,
              amount,
              cashback_earned: cashback,
            },
          });
        }
      );
    }
  );
}
