/**
 * GET /api/workouts/list
 * Get workouts by recovery phase
 */

import { NextApiRequest, NextApiResponse } from 'next';

const workouts = {
  phase1: [
    {
      id: 1,
      name: 'Gentle Pelvic Floor Activation',
      duration: 8,
      difficulty: 'Beginner',
      description: 'Safe activation of pelvic floor post-delivery',
      icon: '🧘',
      videoUrl: 'https://example.com/video1',
      deliveryType: ['vaginal', 'csection'],
      week: '0-2',
    },
    {
      id: 2,
      name: 'Breathing & Diaphragm Work',
      duration: 5,
      difficulty: 'Beginner',
      description: 'Restore proper breathing patterns',
      icon: '💨',
      videoUrl: 'https://example.com/video2',
      deliveryType: ['vaginal', 'csection'],
      week: '0-2',
    },
    {
      id: 3,
      name: 'C-Section Scar Care',
      duration: 10,
      difficulty: 'Beginner',
      description: 'Gentle mobilization of incision site',
      icon: '💚',
      videoUrl: 'https://example.com/video3',
      deliveryType: ['csection'],
      week: '0-4',
    },
  ],
  phase2: [
    {
      id: 4,
      name: 'Core Activation Series',
      duration: 15,
      difficulty: 'Intermediate',
      description: 'Progressive core strengthening',
      icon: '💪',
      videoUrl: 'https://example.com/video4',
      deliveryType: ['vaginal', 'csection'],
      week: '3-6',
    },
    {
      id: 5,
      name: 'Standing Balance Work',
      duration: 10,
      difficulty: 'Intermediate',
      description: 'Restore balance and proprioception',
      icon: '⚖️',
      videoUrl: 'https://example.com/video5',
      deliveryType: ['vaginal', 'csection'],
      week: '4-6',
    },
  ],
  phase3: [
    {
      id: 6,
      name: 'Full Body Strength',
      duration: 25,
      difficulty: 'Advanced',
      description: 'Return to functional strength training',
      icon: '🏋️',
      videoUrl: 'https://example.com/video6',
      deliveryType: ['vaginal', 'csection'],
      week: '8-12',
    },
    {
      id: 7,
      name: 'Running Prep Program',
      duration: 20,
      difficulty: 'Advanced',
      description: 'Safe return to running',
      icon: '🏃',
      videoUrl: 'https://example.com/video7',
      deliveryType: ['vaginal', 'csection'],
      week: '8-12',
    },
  ],
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { phase = 1 } = req.query;

  const phaseKey = `phase${phase}` as keyof typeof workouts;
  const phaseWorkouts = workouts[phaseKey];

  if (!phaseWorkouts) {
    return res.status(400).json({ message: 'Invalid phase' });
  }

  return res.status(200).json({ workouts: phaseWorkouts });
}
