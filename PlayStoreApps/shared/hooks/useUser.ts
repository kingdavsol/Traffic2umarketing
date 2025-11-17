/**
 * useUser Hook - Access current user & subscription data
 */

'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  subscription: {
    tier: 'free' | 'premium' | 'trial';
    startDate?: Date;
    endDate?: Date;
    cancellationDate?: Date;
  };
  gamification: {
    points: number;
    badges: string[];
    level: number;
    streak: number;
  };
  preferences: {
    darkMode: boolean;
    notifications: boolean;
    emailNotifications: boolean;
  };
}

export function useUser() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (status === 'unauthenticated') {
        setUser(null);
        setLoading(false);
        return;
      }

      if (status === 'authenticated' && session?.user?.email) {
        try {
          const response = await fetch('/api/user/profile');
          const data = await response.json();

          if (response.ok) {
            setUser(data);
          } else {
            setError(data.message || 'Failed to load user profile');
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUser();
  }, [session, status]);

  return {
    user,
    loading,
    error,
    isAuthenticated: status === 'authenticated',
    isPremium: user?.subscription?.tier === 'premium',
    isTrial: user?.subscription?.tier === 'trial',
  };
}
