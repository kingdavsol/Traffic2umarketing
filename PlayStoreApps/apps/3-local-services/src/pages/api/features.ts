/**
 * GET /api/features
 * Get app features
 */

export default function handler(req, res) {
  return res.status(200).json({
    features: [
      { name: "Service Verification", description: "Premium feature" },
      { name: "Transparent Pricing", description: "For all users" },
      { name: "Smart Matching", description: "Exclusive" },
    ]
  });
}
