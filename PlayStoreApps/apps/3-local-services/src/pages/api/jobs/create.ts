/**
 * API Route: Create Job Posting
 * POST /api/jobs/create
 *
 * Creates a new job posting for customers to get quotes from providers
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

    const { category, description, budget, timeline, photos } = req.body;

    // Validate required fields
    if (!category || !description || !budget) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // TODO: Save to database when connected
    // const db = client.db('local-services');
    // const result = await db.collection('jobs').insertOne({
    //   customerId: session.user.email,
    //   category,
    //   description,
    //   budget,
    //   timeline,
    //   photos: photos || [],
    //   status: 'open',
    //   createdAt: new Date(),
    //   proposals: [],
    // });

    return res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      jobId: Math.random().toString(36).substr(2, 9),
      data: {
        category,
        description,
        budget,
        timeline,
        status: 'open',
      },
    });
  } catch (error) {
    console.error('Error creating job:', error);
    return res.status(500).json({ error: 'Failed to create job' });
  }
}
