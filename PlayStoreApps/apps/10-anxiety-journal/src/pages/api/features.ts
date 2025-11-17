/**
 * GET /api/features
 * Get app features
 */

export default function handler(req, res) {
  return res.status(200).json({
    features: [
      { name: "30-Second Prompts", description: "Premium feature" },
      { name: "AI Trigger Detection", description: "For all users" },
      { name: "Biofeedback", description: "Exclusive" },
    ]
  });
}
