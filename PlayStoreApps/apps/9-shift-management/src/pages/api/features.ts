/**
 * GET /api/features
 * Get app features
 */

export default function handler(req, res) {
  return res.status(200).json({
    features: [
      { name: "Drag-Drop Scheduling", description: "Premium feature" },
      { name: "Text Notifications", description: "For all users" },
      { name: "POS Integration", description: "Exclusive" },
    ]
  });
}
