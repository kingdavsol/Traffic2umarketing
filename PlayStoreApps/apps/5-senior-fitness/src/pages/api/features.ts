/**
 * GET /api/features
 * Get app features
 */

export default function handler(req, res) {
  return res.status(200).json({
    features: [
      { name: "Fall Risk Assessment", description: "Premium feature" },
      { name: "Balance Training", description: "For all users" },
      { name: "Caregiver Access", description: "Exclusive" },
    ]
  });
}
