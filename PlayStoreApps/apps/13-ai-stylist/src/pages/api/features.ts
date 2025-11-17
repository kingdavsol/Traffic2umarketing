/**
 * GET /api/features
 * Get app features
 */

export default function handler(req, res) {
  return res.status(200).json({
    features: [
      { name: "Budget Constraints", description: "Premium feature" },
      { name: "Sustainability Scoring", description: "For all users" },
      { name: "Retail Integration", description: "Exclusive" },
    ]
  });
}
