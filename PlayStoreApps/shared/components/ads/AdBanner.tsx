/**
 * Reusable Ad Banner Component
 * Google AdMob banner ads (320x50, 300x250, 728x90)
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { useUser } from '@/shared/hooks/useUser';
import { AD_UNITS, AD_FORMATS } from '@/shared/config/ad-config';

interface AdBannerProps {
  placement: 'top' | 'bottom';
  size?: 'responsive' | '320x50' | '300x250' | '728x90';
  appId: string;
  className?: string;
}

export function AdBanner({
  placement,
  size = 'responsive',
  appId,
  className = '',
}: AdBannerProps) {
  const { user } = useUser();
  const adRef = useRef<HTMLDivElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);

  // Don't show ads to premium users
  if (user?.subscription?.tier === 'premium') {
    return null;
  }

  useEffect(() => {
    // Initialize Google AdSense/AdMob
    if (!window.adsbygoogle) {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-xxxxxxxxxxxxxxxx';
      script.onload = () => {
        if (window.adsbygoogle) {
          window.adsbygoogle.push({});
          setAdLoaded(true);
        }
      };
      document.head.appendChild(script);
    } else {
      window.adsbygoogle.push({});
      setAdLoaded(true);
    }
  }, []);

  const adClass = size === 'responsive' ? 'ad-banner-responsive' : `ad-${size}`;

  return (
    <div
      className={`ad-container ad-${placement} ${className}`}
      ref={adRef}
      style={{
        textAlign: 'center',
        padding: '10px 0',
      }}
    >
      <ins
        className={`adsbygoogle ${adClass}`}
        style={{
          display: 'block',
        }}
        data-ad-format={size === 'responsive' ? 'auto' : 'rectangle'}
        data-ad-client="ca-pub-xxxxxxxxxxxxxxxx"
        data-ad-slot={getAdSlotId(appId, 'banner')}
      ></ins>
    </div>
  );
}

interface AdInterstitialProps {
  appId: string;
  trigger?: 'after_action' | 'timed' | 'manual';
  onClose?: () => void;
}

/**
 * Interstitial Ad - Full screen ads shown between app actions
 */
export function AdInterstitial({
  appId,
  trigger = 'after_action',
  onClose,
}: AdInterstitialProps) {
  const { user } = useUser();
  const [showAd, setShowAd] = useState(false);

  if (user?.subscription?.tier === 'premium') {
    return null;
  }

  useEffect(() => {
    // Simplified interstitial trigger logic
    // In production, use Google Mobile Ads SDK
    if (trigger === 'after_action') {
      const timer = setTimeout(() => {
        // Show after action completes
        // This would integrate with Google Mobile Ads SDK
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [trigger]);

  // Placeholder for actual interstitial
  // In production, use: googleMobileAdsConsentMode & InterstitialAd from @react-native-google-mobile-ads
  return null;
}

/**
 * Rewarded Ad - Users watch to earn premium currency/features
 */
interface RewardedAdProps {
  appId: string;
  reward: {
    type: 'points' | 'premium_time' | 'feature_unlock';
    amount: number;
    label: string;
  };
  onRewardEarned: () => Promise<void>;
  onAdClosed?: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function RewardedAdButton({
  appId,
  reward,
  onRewardEarned,
  onAdClosed,
  disabled = false,
  children = `Watch Ad to Earn ${reward.amount} ${reward.label}`,
}: RewardedAdProps) {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);

  if (user?.subscription?.tier === 'premium') {
    return null; // Premium users don't need to watch ads
  }

  const handleWatchAd = async () => {
    setIsLoading(true);
    setAdError(null);

    try {
      // In production, integrate with Google Mobile Ads SDK
      // For web: Use HTML5 video + mock reward
      await simulateRewardedAd();
      await onRewardEarned();
    } catch (error) {
      setAdError(error instanceof Error ? error.message : 'Failed to load ad');
    } finally {
      setIsLoading(false);
      onAdClosed?.();
    }
  };

  return (
    <div className="rewarded-ad-wrapper">
      <button
        onClick={handleWatchAd}
        disabled={disabled || isLoading}
        className="btn btn-secondary"
      >
        {isLoading ? 'Loading Ad...' : children}
      </button>
      {adError && <p className="error-text text-sm mt-2">{adError}</p>}
    </div>
  );
}

/**
 * Native Ad - Content-matched ads styled like app content
 */
interface NativeAdProps {
  appId: string;
  style?: React.CSSProperties;
}

export function NativeAd({ appId, style }: NativeAdProps) {
  const { user } = useUser();

  if (user?.subscription?.tier === 'premium') {
    return null;
  }

  return (
    <div
      className="native-ad-container"
      style={{
        padding: '12px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
        marginVertical: '12px',
        ...style,
      }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-format="native"
        data-ad-client="ca-pub-xxxxxxxxxxxxxxxx"
        data-ad-slot={getAdSlotId(appId, 'native')}
      ></ins>
    </div>
  );
}

// Helper functions
function getAdSlotId(appId: string, format: string): string {
  // Map app IDs to ad slot IDs from AdMob console
  const slotMap: Record<string, Record<string, string>> = {
    'mental-health-pro': {
      banner: '1234567890',
      interstitial: '0987654321',
      rewarded: '1111111111',
    },
    // Add more apps...
  };

  return slotMap[appId]?.[format] || '0000000000';
}

async function simulateRewardedAd(): Promise<void> {
  // Simulate watching a 15-30 second ad
  return new Promise((resolve) => {
    setTimeout(resolve, 5000); // 5 second demo
  });
}

// Global type declaration
declare global {
  interface Window {
    adsbygoogle: any;
  }
}
