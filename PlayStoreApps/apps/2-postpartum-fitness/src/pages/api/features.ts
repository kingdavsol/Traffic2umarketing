/**
 * GET /api/features
 * Get app features
 */

export default function handler(req, res) {
  return res.status(200).json({
    features: [
      { name: "Pelvic Floor Focus", description: "Premium feature" },
      { name: "Recovery Phases", description: "For all users" },
      { name: "PT-Verified Content", description: "Exclusive" },
    ]
  });
}
