import React, { useEffect, useState } from 'react';
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
