const db = require('../../../lib/db');

export default function handler(req, res) {
  db.all('SELECT * FROM providers', (err, providers) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch providers' });
    }

    res.json({ providers: providers || [] });
  });
}
