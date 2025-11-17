/**
 * GET /api/features
 * Get app features
 */

export default function handler(req, res) {
  return res.status(200).json({
    features: [
      { name: "AI Stress Detection", description: "Premium feature" },
      { name: "Micro-Interventions", description: "For all users" },
      { name: "Corporate Dashboard", description: "Exclusive" },
    ]
  });
}
