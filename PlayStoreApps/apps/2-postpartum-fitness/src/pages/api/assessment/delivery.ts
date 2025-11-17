/**
 * API Route: Save Delivery & Recovery Assessment
 * POST /api/assessment/delivery
 *
 * Saves user's delivery type, tear severity, and complications for personalized content
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

    const { deliveryType, tearDegree, complications } = req.body;

    // Validate input
    const validDeliveryTypes = ['vaginal', 'c-section', 'instrumental'];
    if (!validDeliveryTypes.includes(deliveryType)) {
      return res.status(400).json({ error: 'Invalid delivery type' });
    }

    // TODO: Save to database when connected
    // const db = client.db('postpartum-fitness');
    // const result = await db.collection('delivery_assessments').insertOne({
    //   userId: session.user.email,
    //   deliveryType,
    //   tearDegree,
    //   complications,
    //   completedAt: new Date(),
    // });

    // Personalized recommendations based on delivery type
    const recommendations = getRecommendations(deliveryType, tearDegree);

    return res.status(201).json({
      success: true,
      message: 'Assessment saved successfully',
      data: {
        deliveryType,
        tearDegree,
        complications,
        recommendations,
      },
    });
  } catch (error) {
    console.error('Error saving assessment:', error);
    return res.status(500).json({ error: 'Failed to save assessment' });
  }
}

function getRecommendations(
  deliveryType: string,
  tearDegree: string
): string[] {
  const recommendations: string[] = [];

  if (deliveryType === 'vaginal') {
    recommendations.push('Focus on pelvic floor strengthening');
    recommendations.push('Avoid high-impact activities for 6 weeks');
  } else if (deliveryType === 'c-section') {
    recommendations.push('Gentle core engagement (avoid crunches)');
    recommendations.push('Scar tissue mobility work after 6 weeks');
    recommendations.push('Abdominal breathing exercises');
  } else if (deliveryType === 'instrumental') {
    recommendations.push('Extended pelvic floor recovery timeline');
    recommendations.push('Pain management focus');
  }

  if (tearDegree === '3rd' || tearDegree === '4th') {
    recommendations.push('Work with a physical therapist');
    recommendations.push('Conservative progression timeline');
  }

  return recommendations;
}
