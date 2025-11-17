/**
 * GET /api/features
 * Get app features
 */

export default function handler(req, res) {
  return res.status(200).json({
    features: [
      { name: "Smart Scheduling", description: "Premium feature" },
      { name: "Eye Care", description: "For all users" },
      { name: "Posture Monitoring", description: "Exclusive" },
    ]
  });
}
