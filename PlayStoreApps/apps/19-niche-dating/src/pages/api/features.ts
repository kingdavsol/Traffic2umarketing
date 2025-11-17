/**
 * GET /api/features
 * Get app features
 */

export default function handler(req, res) {
  return res.status(200).json({
    features: [
      { name: "Interest Verification", description: "Premium feature" },
      { name: "Event Integration", description: "For all users" },
      { name: "Compatibility Scoring", description: "Exclusive" },
    ]
  });
}
