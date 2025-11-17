/**
 * GET /api/features
 * Get app features
 */

export default function handler(req, res) {
  return res.status(200).json({
    features: [
      { name: "Portfolio Embedding", description: "Premium feature" },
      { name: "Time Tracking", description: "For all users" },
      { name: "Client Collaboration", description: "Exclusive" },
    ]
  });
}
