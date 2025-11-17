/**
 * GET /api/features
 * Get app features
 */

export default function handler(req, res) {
  return res.status(200).json({
    features: [
      { name: "Multi-Child Tracking", description: "Premium feature" },
      { name: "Co-Parent Sync", description: "For all users" },
      { name: "Reward System", description: "Exclusive" },
    ]
  });
}
