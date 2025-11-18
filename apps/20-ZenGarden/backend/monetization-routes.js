const express = require('express');
const router = express.Router();

// Validate purchase receipt
router.post('/purchase', async (req, res) => {
  try {
    const { productId, receipt } = req.body;

    // Verify receipt with payment provider
    // (Google Play Billing / Apple App Store)

    // Save purchase to database
    const purchase = new Purchase({
      userId: req.userId,
      productId,
      receipt,
      status: 'completed',
      timestamp: new Date()
    });

    await purchase.save();

    // Update user subscription status
    await User.findByIdAndUpdate(req.userId, {
      subscription: productId,
      subscriptionExpiry: calculateExpiry(productId)
    });

    res.json({
      success: true,
      purchase: purchase,
      message: 'Purchase completed successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user subscription status
router.get('/subscription', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json({
      subscription: user.subscription,
      expiry: user.subscriptionExpiry,
      isActive: user.subscriptionExpiry > new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel subscription
router.post('/cancel-subscription', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, {
      subscription: null,
      subscriptionExpiry: null
    });

    res.json({ success: true, message: 'Subscription cancelled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Track ad impressions
router.post('/ad-impression', async (req, res) => {
  try {
    const { adType, adNetwork } = req.body;

    const impression = new AdImpression({
      userId: req.userId,
      adType,
      adNetwork,
      timestamp: new Date()
    });

    await impression.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics
router.get('/analytics', async (req, res) => {
  try {
    const totalPurchases = await Purchase.countDocuments();
    const totalRevenue = await Purchase.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const adImpressions = await AdImpression.countDocuments();

    res.json({
      totalPurchases,
      totalRevenue: totalRevenue[0]?.total || 0,
      adImpressions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
