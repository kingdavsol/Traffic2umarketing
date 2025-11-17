/**
 * GET /api/features
 * Get app features
 */

export default function handler(req, res) {
  return res.status(200).json({
    features: [
      { name: "Real-Time Inventory", description: "Premium feature" },
      { name: "Same-Day Delivery", description: "For all users" },
      { name: "AI Pricing", description: "Exclusive" },
    ]
  });
}
