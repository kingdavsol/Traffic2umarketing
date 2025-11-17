/**
 * GET /api/features
 * Get app features
 */

export default function handler(req, res) {
  return res.status(200).json({
    features: [
      { name: "Diverse Interviewers", description: "Premium feature" },
      { name: "Bias Training", description: "For all users" },
      { name: "Salary Negotiation", description: "Exclusive" },
    ]
  });
}
