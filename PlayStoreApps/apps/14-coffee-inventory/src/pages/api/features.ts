/**
 * GET /api/features
 * Get app features
 */

export default function handler(req, res) {
  return res.status(200).json({
    features: [
      { name: "Recipe Costing", description: "Premium feature" },
      { name: "Waste Tracking", description: "For all users" },
      { name: "Supplier Ordering", description: "Exclusive" },
    ]
  });
}
