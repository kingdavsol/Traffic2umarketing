/**
 * API Route: AI Task Breakdown
 * POST /api/tasks/breakdown
 *
 * Uses GPT to break down large tasks into smaller, manageable steps
 * Helps ADHD users overcome analysis paralysis and executive dysfunction
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

    const { taskTitle, difficulty = 'medium' } = req.body;

    if (!taskTitle) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    // TODO: In production, call OpenAI API
    // const response = await openai.createChatCompletion({
    //   model: 'gpt-3.5-turbo',
    //   messages: [{
    //     role: 'user',
    //     content: `Break down this task for someone with ADHD into 5-7 micro-steps that take 15-30 min each:
    //     "${taskTitle}"
    //     Format: JSON array of steps with duration estimates`
    //   }],
    //   temperature: 0.7,
    // });

    // Mock breakdown for now
    const breakdowns: { [key: string]: string[] } = {
      'write report': [
        'Research topic (30 min)',
        'Create outline (20 min)',
        'Write introduction (15 min)',
        'Write body sections (45 min)',
        'Write conclusion (15 min)',
        'Edit and proofread (20 min)',
      ],
      'clean room': [
        'Set timer for 20 min',
        'Pick up clothes and put in hamper (10 min)',
        'Move items to desk area (10 min)',
        'Organize desk items (10 min)',
        'Vacuum or sweep floor (15 min)',
        'Make bed (5 min)',
      ],
      'email cleanup': [
        'Set filter for read emails (5 min)',
        'Archive older emails in batches (10 min)',
        'Unsubscribe from 3 newsletters (10 min)',
        'Mark important as flagged (10 min)',
        'Create folders for projects (10 min)',
        'Set up auto-responses (5 min)',
      ],
    };

    const matchedKey = Object.keys(breakdowns).find((key) =>
      taskTitle.toLowerCase().includes(key)
    );
    const steps = matchedKey ? breakdowns[matchedKey] : defaultBreakdown(taskTitle);

    return res.status(200).json({
      success: true,
      taskTitle,
      steps,
      estimatedTotalTime: '2-3 hours',
      tips: [
        'Take a 5-10 minute break between steps',
        'Use the Pomodoro timer for each step',
        'Celebrate each completed step!',
      ],
    });
  } catch (error) {
    console.error('Error breaking down task:', error);
    return res.status(500).json({ error: 'Failed to break down task' });
  }
}

function defaultBreakdown(taskTitle: string): string[] {
  return [
    `Define what "${taskTitle}" specifically means (5-10 min)`,
    `List all required steps for "${taskTitle}" (10-15 min)`,
    `Organize steps by priority (5 min)`,
    `Estimate time for each step (10 min)`,
    `Identify any blockers or dependencies (10 min)`,
    `Do first micro-step of "${taskTitle}" (15-20 min)`,
  ];
}
