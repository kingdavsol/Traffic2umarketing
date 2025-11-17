/**
 * GET /api/features
 * Get app features
 */

export default function handler(req, res) {
  return res.status(200).json({
    features: [
      { name: "Project Assessment", description: "Premium feature" },
      { name: "Employer Verification", description: "For all users" },
      { name: "LinkedIn Integration", description: "Exclusive" },
    ]
  });
}
