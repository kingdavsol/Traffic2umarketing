const db = require('../../../lib/db');

export default function handler(req, res) {
  db.all('SELECT j.*, u.name as posted_by_name FROM jobs j LEFT JOIN users u ON j.posted_by = u.id ORDER BY j.created_at DESC LIMIT 50',
    (err, jobs) => {
      if (err) return res.status(500).json({error: 'Server error'});
      res.json({ jobs: jobs || [] });
    }
  );
}
