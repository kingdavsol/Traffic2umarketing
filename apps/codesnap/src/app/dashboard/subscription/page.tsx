'use client';

import { useState, useEffect } from 'react';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@traffic2u/ui';
import { CreditCard, Package, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface SubscriptionData {
  plan: string;
  status: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  usageCount: number;
  usageLimit: number;
}

export default function SubscriptionPage() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscription');
      if (!response.ok) {
        throw new Error('Failed to fetch subscription');
      }
      const data = await response.json();
      setSubscription(data);
    } catch (error) {
      console.error('Subscription fetch error:', error);
      toast.error('Failed to load subscription details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will retain access until the end of your billing period.')) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      toast.success('Subscription canceled. You will retain access until the end of your billing period.');
      fetchSubscription();
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/subscription/reactivate', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to reactivate subscription');
      }

      toast.success('Subscription reactivated successfully!');
      fetchSubscription();
    } catch (error) {
      console.error('Reactivate error:', error);
      toast.error('Failed to reactivate subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="success">Active</Badge>;
      case 'TRIALING':
        return <Badge variant="default">Trial</Badge>;
      case 'PAST_DUE':
        return <Badge variant="destructive">Past Due</Badge>;
      case 'CANCELED':
        return <Badge variant="outline">Canceled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPlanName = (plan: string) => {
    return plan.charAt(0) + plan.slice(1).toLowerCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">No subscription found.</p>
            <Button className="w-full mt-4" onClick={() => router.push('/pricing')}>
              View Plans
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const usagePercentage = (subscription.usageCount / subscription.usageLimit) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8">Subscription & Billing</h1>

        {/* Current Plan */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Package className="h-6 w-6 text-blue-600" />
                <CardTitle>Current Plan</CardTitle>
              </div>
              {getStatusBadge(subscription.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Plan</p>
                <p className="text-2xl font-bold">{getPlanName(subscription.plan)}</p>
              </div>

              {subscription.plan !== 'FREE' && (
                <>
                  <div>
                    <p className="text-sm text-gray-600">Billing Period</p>
                    <p className="text-lg">
                      {subscription.cancelAtPeriodEnd ? (
                        <span className="text-orange-600">
                          Cancels on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                        </span>
                      ) : (
                        `Renews on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                      )}
                    </p>
                  </div>

                  {subscription.status === 'PAST_DUE' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-900">Payment Failed</p>
                        <p className="text-sm text-red-700">
                          Your last payment failed. Please update your payment method to continue using CodeSnap.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="flex space-x-3 pt-4">
                {subscription.plan !== 'PROFESSIONAL' && subscription.plan !== 'ENTERPRISE' && (
                  <Button onClick={handleUpgrade}>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Upgrade Plan
                  </Button>
                )}

                {subscription.plan !== 'FREE' && (
                  <>
                    {subscription.cancelAtPeriodEnd ? (
                      <Button
                        variant="outline"
                        onClick={handleReactivateSubscription}
                        disabled={actionLoading}
                      >
                        {actionLoading ? 'Processing...' : 'Reactivate Subscription'}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={handleCancelSubscription}
                        disabled={actionLoading}
                      >
                        {actionLoading ? 'Processing...' : 'Cancel Subscription'}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <CardTitle>Usage This Month</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Code Conversions</p>
                  <p className="text-sm font-semibold">
                    {subscription.usageCount} / {subscription.usageLimit === Infinity ? '∞' : subscription.usageLimit}
                  </p>
                </div>
                {subscription.usageLimit !== Infinity && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        usagePercentage >= 90
                          ? 'bg-red-500'
                          : usagePercentage >= 70
                          ? 'bg-orange-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                    ></div>
                  </div>
                )}
              </div>

              {usagePercentage >= 80 && subscription.usageLimit !== Infinity && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-sm text-orange-900">
                    You've used {Math.round(usagePercentage)}% of your monthly conversions.{' '}
                    {subscription.plan === 'FREE' && (
                      <Link href="/pricing" className="font-semibold underline">
                        Upgrade to get more conversions.
                      </Link>
                    )}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        {subscription.plan !== 'FREE' && (
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <CreditCard className="h-6 w-6 text-blue-600" />
                <CardTitle>Payment Method</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Manage your payment methods through the Stripe customer portal.
              </p>
              <Button variant="outline" onClick={() => window.open('https://billing.stripe.com/p/login/test_YOUR_PORTAL_ID', '_blank')}>
                Manage Payment Methods
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
