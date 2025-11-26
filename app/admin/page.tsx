'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, DollarSign, FileText, TrendingUp, Loader2 } from 'lucide-react'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    fetchStats()
  }, [session, status, router])

  const fetchStats = async () => {
    // In a real app, this would fetch from an API
    setStats({
      totalUsers: 1247,
      newUsers: 89,
      freeUsers: 892,
      basicUsers: 213,
      builderUsers: 98,
      premiumUsers: 44,
      totalCaptions: 45678,
      monthlyRevenue: 5430,
      growth: 23.5,
    })
    setIsLoading(false)
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!session || session.user.role !== 'admin') {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>
      </header>

      <main className="flex-1 bg-muted/20">
        <div className="container py-10">
          <div className="mb-8">
            <h2 className="text-3xl font-bold">Overview</h2>
            <p className="text-muted-foreground">
              Monitor your platform's performance and metrics
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats.newUsers} new this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${stats.monthlyRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{stats.growth}% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Captions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCaptions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">All-time generated</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{stats.growth}%</div>
                <p className="text-xs text-muted-foreground">Month over month</p>
              </CardContent>
            </Card>
          </div>

          {/* Subscription Breakdown */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Distribution</CardTitle>
                <CardDescription>Breakdown of users by plan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-3 h-3 w-3 rounded-full bg-gray-500" />
                    <span className="text-sm">Free</span>
                  </div>
                  <span className="text-sm font-bold">{stats.freeUsers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-3 h-3 w-3 rounded-full bg-blue-500" />
                    <span className="text-sm">Basic ($9/mo)</span>
                  </div>
                  <span className="text-sm font-bold">{stats.basicUsers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-3 h-3 w-3 rounded-full bg-purple-500" />
                    <span className="text-sm">Builder ($19/mo)</span>
                  </div>
                  <span className="text-sm font-bold">{stats.builderUsers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-3 h-3 w-3 rounded-full bg-primary" />
                    <span className="text-sm">Premium ($29/mo)</span>
                  </div>
                  <span className="text-sm font-bold">{stats.premiumUsers}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Monthly recurring revenue by plan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Basic Plan</span>
                  <span className="text-sm font-bold">
                    ${(stats.basicUsers * 9).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Builder Plan</span>
                  <span className="text-sm font-bold">
                    ${(stats.builderUsers * 19).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Premium Plan</span>
                  <span className="text-sm font-bold">
                    ${(stats.premiumUsers * 29).toLocaleString()}
                  </span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Total MRR</span>
                    <span className="text-lg font-bold text-primary">
                      ${stats.monthlyRevenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
