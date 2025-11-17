/**
 * GET /api/features
 * Get app features
 */

export default function handler(req, res) {
  return res.status(200).json({
    features: [
      { name: "Income Forecasting", description: "Premium feature" },
      { name: "Auto Tax Deductions", description: "For all users" },
      { name: "Quarterly Taxes", description: "Exclusive" },
    ]
  });
}
