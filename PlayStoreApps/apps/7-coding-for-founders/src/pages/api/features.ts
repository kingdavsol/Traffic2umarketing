/**
 * GET /api/features
 * Get app features
 */

export default function handler(req, res) {
  return res.status(200).json({
    features: [
      { name: "Live Expert Q&A", description: "Premium feature" },
      { name: "Founder Case Studies", description: "For all users" },
      { name: "Project-Based", description: "Exclusive" },
    ]
  });
}
