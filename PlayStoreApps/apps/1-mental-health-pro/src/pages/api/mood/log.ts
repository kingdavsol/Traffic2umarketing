/**
 * API Route: Log Mood Entry
 * POST /api/mood/log
 *
 * Logs a user's mood entry with optional trigger and notes
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { mood, trigger, notes, stressLevel } = req.body;

    // Validate mood (1-5)
    if (!mood || mood < 1 || mood > 5) {
      return res.status(400).json({ error: 'Mood must be between 1 and 5' });
    }

    // TODO: Save to database when connected
    // const db = client.db('mental-health-pro');
    // const result = await db.collection('moods').insertOne({
    //   userId: session.user.email,
    //   date: new Date(),
    //   mood,
    //   trigger,
    //   notes,
    //   stressLevel,
    // });

    // Award points for mood logging (gamification)
    // POST to /api/gamification/award-points with points: 5

    return res.status(201).json({
      success: true,
      message: 'Mood logged successfully',
      data: {
        mood,
        trigger,
        notes,
        stressLevel,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('Error logging mood:', error);
    return res.status(500).json({ error: 'Failed to log mood' });
  }
}
