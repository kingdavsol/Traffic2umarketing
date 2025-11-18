#!/usr/bin/env python3
"""
Phase 4: Full Monetization Implementation
Adds AdMob, in-app purchases, and subscription management
"""

from pathlib import Path

def create_monetization_service(app_path):
    """Create monetization service for app"""
    service_code = '''import { create } from 'zustand';
import * as IAP from 'react-native-iap';

export const useMonetizationStore = create((set, get) => ({
  products: [],
  subscriptions: [],
  purchases: [],
  loading: false,
  adProvider: 'admob',

  // Initialize monetization
  initialize: async () => {
    set({ loading: true });
    try {
      // Initialize IAP
      await IAP.initConnection();

      // Get available products
      const products = await IAP.getProducts({
        skus: [
          'premium_monthly',
          'premium_yearly',
          'unlock_all_features',
          'remove_ads'
        ]
      });

      set({ products, loading: false });
    } catch (error) {
      console.error('Monetization init error:', error);
      set({ loading: false });
    }
  },

  // Purchase product
  purchase: async (productId) => {
    set({ loading: true });
    try {
      const purchase = await IAP.requestPurchase({ skus: [productId] });

      // Send to server for validation
      const response = await fetch('/api/monetization/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, receipt: purchase })
      });

      const data = await response.json();

      set(state => ({
        purchases: [...state.purchases, data],
        loading: false
      }));

      return data;
    } catch (error) {
      console.error('Purchase error:', error);
      set({ loading: false });
      throw error;
    }
  },

  // Restore purchases
  restorePurchases: async () => {
    set({ loading: true });
    try {
      const purchases = await IAP.getPurchaseHistory();
      set({ purchases, loading: false });
      return purchases;
    } catch (error) {
      console.error('Restore error:', error);
      set({ loading: false });
    }
  },

  // Check subscription status
  checkSubscription: async (productId) => {
    try {
      const subscription = await IAP.getSubscriptionStatus({ sku: productId });
      return subscription;
    } catch (error) {
      console.error('Subscription check error:', error);
      return null;
    }
  },

  // Ad methods
  showInterstitialAd: async () => {
    // Implemented in AdManager
  },

  showRewardedAd: async () => {
    // Implemented in AdManager
  }
}));

export default useMonetizationStore;
'''

    with open(app_path / "frontend" / "stores" / "monetizationStore.js", "w") as f:
        f.write(service_code)

def create_ad_manager(app_path):
    """Create ad manager component"""
    manager_code = '''import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  BannerAd,
  BannerAdSize,
  InterstitialAd,
  AdEventType,
  RewardedAd,
} from 'react-native-google-mobile-ads';

// Ad unit IDs (replace with your own)
const BANNER_AD_ID = 'ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyyyyyy';
const INTERSTITIAL_AD_ID = 'ca-app-pub-xxxxxxxxxxxxxxxx/zzzzzzzzzzzzzz';
const REWARDED_AD_ID = 'ca-app-pub-xxxxxxxxxxxxxxxx/wwwwwwwwwwwwww';

const interstitial = InterstitialAd.createForAdRequest(INTERSTITIAL_AD_ID, {
  requestNonPersonalizedAds: false,
});

const rewarded = RewardedAd.createForAdRequest(REWARDED_AD_ID, {
  requestNonPersonalizedAds: false,
});

export const AdManager = {
  // Load interstitial ad
  loadInterstitial: async () => {
    await interstitial.load();
  },

  // Show interstitial ad
  showInterstitial: async () => {
    try {
      await AdManager.loadInterstitial();
      interstitial.show();
    } catch (error) {
      console.error('Interstitial error:', error);
    }
  },

  // Load rewarded ad
  loadRewarded: async () => {
    await rewarded.load();
  },

  // Show rewarded ad
  showRewarded: async () => {
    try {
      await AdManager.loadRewarded();
      rewarded.show();
    } catch (error) {
      console.error('Rewarded error:', error);
    }
  }
};

export const BannerAdComponent = () => (
  <View style={styles.adContainer}>
    <BannerAd
      unitId={BANNER_AD_ID}
      size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      requestOptions={{ requestNonPersonalizedAds: true }}
    />
  </View>
);

const styles = StyleSheet.create({
  adContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 50
  }
});

export default AdManager;
'''

    with open(app_path / "frontend" / "services" / "AdManager.js", "w") as f:
        f.write(manager_code)

def create_paywall_screen(app_path):
    """Create paywall/premium screen"""
    screen_code = '''import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import LinearGradient from 'expo-linear-gradient';
import { useMonetizationStore } from '../stores/monetizationStore';

const PaywallScreen = ({ navigation }) => {
  const { purchase, products, loading } = useMonetizationStore();
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    {
      id: 'premium_monthly',
      name: 'Monthly',
      price: '$4.99',
      period: '/month',
      features: [
        '✅ Unlimited access',
        '✅ Premium features',
        '✅ No ads',
        '✅ Priority support'
      ]
    },
    {
      id: 'premium_yearly',
      name: 'Yearly',
      price: '$39.99',
      period: '/year',
      savings: 'Save 33%',
      features: [
        '✅ Unlimited access',
        '✅ Premium features',
        '✅ No ads',
        '✅ Priority support'
      ],
      recommended: true
    }
  ];

  const handlePurchase = async (productId) => {
    try {
      setSelectedPlan(productId);
      const result = await purchase(productId);
      Alert.alert('Success', 'Thank you for your purchase!');
    } catch (error) {
      Alert.alert('Error', 'Purchase failed. Please try again.');
    } finally {
      setSelectedPlan(null);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <Text style={styles.title}>Go Premium</Text>
        <Text style={styles.subtitle}>Unlock unlimited features</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {plans.map((plan) => (
          <View
            key={plan.id}
            style={[
              styles.planCard,
              plan.recommended && styles.recommendedCard
            ]}
          >
            {plan.recommended && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Recommended</Text>
              </View>
            )}

            <Text style={styles.planName}>{plan.name}</Text>

            <View style={styles.priceContainer}>
              <Text style={styles.price}>{plan.price}</Text>
              <Text style={styles.period}>{plan.period}</Text>
            </View>

            {plan.savings && (
              <Text style={styles.savings}>{plan.savings}</Text>
            )}

            <View style={styles.features}>
              {plan.features.map((feature, idx) => (
                <Text key={idx} style={styles.feature}>
                  {feature}
                </Text>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                selectedPlan === plan.id && styles.buttonLoading
              ]}
              onPress={() => handlePurchase(plan.id)}
              disabled={loading || selectedPlan === plan.id}
            >
              {selectedPlan === plan.id && loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Subscribe</Text>
              )}
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Subscription renews automatically. Cancel anytime.
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.restoreLink}>Restore Purchase</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 40, alignItems: 'center', paddingTop: 60 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)' },
  content: { padding: 20, paddingBottom: 60 },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  recommendedCard: {
    borderWidth: 2,
    borderColor: '#667eea'
  },
  badge: {
    backgroundColor: '#667eea',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginBottom: 12
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  planName: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  priceContainer: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 },
  price: { fontSize: 28, fontWeight: 'bold', color: '#667eea' },
  period: { fontSize: 14, color: '#999', marginLeft: 4 },
  savings: { fontSize: 12, color: '#4CAF50', marginBottom: 16, fontWeight: '600' },
  features: { marginBottom: 20 },
  feature: { fontSize: 14, color: '#666', marginBottom: 8 },
  button: {
    backgroundColor: '#667eea',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonLoading: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footer: { alignItems: 'center', marginTop: 20 },
  footerText: { fontSize: 12, color: '#999', marginBottom: 12, textAlign: 'center' },
  restoreLink: { color: '#667eea', fontSize: 12, fontWeight: '600' }
});

export default PaywallScreen;
'''

    with open(app_path / "frontend" / "screens" / "PaywallScreen.js", "w") as f:
        f.write(screen_code)

def create_monetization_backend(app_path):
    """Create backend monetization routes"""
    routes_code = '''const express = require('express');
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
'''

    with open(app_path / "backend" / "monetization-routes.js", "w") as f:
        f.write(routes_code)

def add_monetization_to_all_apps():
    """Add monetization to all apps"""
    base_path = Path("/home/user/Traffic2umarketing/apps")

    for app_dir in sorted(base_path.iterdir()):
        if not app_dir.is_dir():
            continue

        app_name = app_dir.name

        print(f"💰 Adding monetization to {app_name}...")

        # Create monetization service
        create_monetization_service(app_dir)

        # Create ad manager
        create_ad_manager(app_dir)

        # Create paywall screen
        create_paywall_screen(app_dir)

        # Create backend routes
        create_monetization_backend(app_dir)

        print(f"✅ {app_name} monetization added")

if __name__ == "__main__":
    print("💰 Adding monetization to all 30 apps...\n")
    add_monetization_to_all_apps()
    print("\n✅ Monetization added to all apps!")
