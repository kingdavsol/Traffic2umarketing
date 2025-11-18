import { create } from 'zustand';
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
