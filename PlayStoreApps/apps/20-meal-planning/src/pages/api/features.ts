/**
 * GET /api/features
 * Get app features
 */

export default function handler(req, res) {
  return res.status(200).json({
    features: [
      { name: "Multi-Diet Support", description: "Premium feature" },
      { name: "Batch Cooking", description: "For all users" },
      { name: "Nutritionist Access", description: "Exclusive" },
    ]
  });
}
