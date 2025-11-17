/**
 * API Route: Log Gig Income
 * POST /api/income/log
 *
 * Tracks income from various gig platforms (DoorDash, Uber, Fiverr, etc.)
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

    const { platform, earnings, category, date } = req.body;

    if (!platform || !earnings || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // TODO: Save to database when connected
    // const db = client.db('gig-worker-finance');
    // await db.collection('gig_jobs').insertOne({
    //   userId: session.user.email,
    //   platform,
    //   earnings: parseFloat(earnings),
    //   category,
    //   date: date || new Date(),
    // });

    return res.status(201).json({
      success: true,
      message: 'Income logged successfully',
      data: { platform, earnings: parseFloat(earnings), category, date },
    });
  } catch (error) {
    console.error('Error logging income:', error);
    return res.status(500).json({ error: 'Failed to log income' });
  }
}
