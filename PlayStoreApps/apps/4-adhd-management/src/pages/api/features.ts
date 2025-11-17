/**
 * GET /api/features
 * Get app features
 */

export default function handler(req, res) {
  return res.status(200).json({
    features: [
      { name: "Hyperfocus Timer", description: "Premium feature" },
      { name: "Task Breakdown AI", description: "For all users" },
      { name: "Dopamine Menu", description: "Exclusive" },
    ]
  });
}
