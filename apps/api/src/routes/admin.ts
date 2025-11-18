import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware: Check if user is admin
const isAdmin = async (req: Request, res: Response, next: () => void) => {
  // TODO: Implement actual admin check based on user role
  // For now, verify JWT token exists
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// ==========================================
// GUIDE MODERATION ENDPOINTS
// ==========================================

/**
 * GET /api/admin/guides/pending
 * Get pending guides awaiting approval
 */
router.get('/guides/pending', isAdmin, async (_req: Request, res: Response) => {
  try {
    const pendingGuides = await prisma.userGuide.findMany({
      where: { status: 'pending_review' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        ratings: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json(pendingGuides);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pending guides' });
  }
});

/**
 * POST /api/admin/guides/:guideId/approve
 * Approve a guide
 */
router.post('/guides/:guideId/approve', isAdmin, async (req: Request, res: Response) => {
  try {
    const { guideId } = req.params;
    const { notes } = req.body;

    const guide = await prisma.userGuide.update({
      where: { id: guideId },
      data: {
        status: 'approved',
        updatedAt: new Date(),
      },
      include: { user: true },
    });

    // Award points to author
    await prisma.userPoints.create({
      data: {
        userId: guide.userId,
        points: 200,
        source: 'guide_approved',
        metadata: { guideId },
      },
    });

    res.json({
      message: 'Guide approved successfully',
      guide,
      pointsAwarded: 200,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve guide' });
  }
});

/**
 * POST /api/admin/guides/:guideId/reject
 * Reject a guide with reason
 */
router.post('/guides/:guideId/reject', isAdmin, async (req: Request, res: Response) => {
  try {
    const { guideId } = req.params;
    const { reason } = req.body;

    const guide = await prisma.userGuide.update({
      where: { id: guideId },
      data: {
        status: 'rejected',
        updatedAt: new Date(),
      },
    });

    res.json({
      message: 'Guide rejected',
      guide,
      reason,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject guide' });
  }
});

/**
 * POST /api/admin/guides/:guideId/feature
 * Feature a guide on homepage
 */
router.post('/guides/:guideId/feature', isAdmin, async (req: Request, res: Response) => {
  try {
    const { guideId } = req.params;

    const guide = await prisma.userGuide.update({
      where: { id: guideId },
      data: { featured: true },
      include: { user: true },
    });

    // Award points to author
    await prisma.userPoints.create({
      data: {
        userId: guide.userId,
        points: 500,
        source: 'guide_featured',
        metadata: { guideId },
      },
    });

    res.json({
      message: 'Guide featured successfully',
      guide,
      pointsAwarded: 500,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to feature guide' });
  }
});

// ==========================================
// ANALYTICS & METRICS ENDPOINTS
// ==========================================

/**
 * GET /api/admin/analytics/overview
 * Get platform overview statistics
 */
router.get('/analytics/overview', isAdmin, async (_req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      totalVehicles,
      totalGuides,
      approvedGuides,
      totalSubscriptions,
      activeSubscriptions,
      totalAlerts,
      activeAlerts,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.vehicle.count(),
      prisma.userGuide.count(),
      prisma.userGuide.count({ where: { status: 'approved' } }),
      prisma.subscription.count(),
      prisma.subscription.count({ where: { status: 'active' } }),
      prisma.priceAlert.count(),
      prisma.priceAlert.count({ where: { isActive: true } }),
    ]);

    const metrics = {
      users: {
        total: totalUsers,
      },
      vehicles: {
        total: totalVehicles,
      },
      guides: {
        total: totalGuides,
        approved: approvedGuides,
        pendingReview: totalGuides - approvedGuides,
      },
      subscriptions: {
        total: totalSubscriptions,
        active: activeSubscriptions,
      },
      priceAlerts: {
        total: totalAlerts,
        active: activeAlerts,
      },
    };

    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

/**
 * GET /api/admin/analytics/revenue
 * Get revenue metrics
 */
router.get('/analytics/revenue', isAdmin, async (_req: Request, res: Response) => {
  try {
    // Get subscription revenue
    const subscriptions = await prisma.subscription.groupBy({
      by: ['plan'],
      _count: true,
    });

    const planPrices: Record<string, number> = {
      free: 0,
      pro: 9.99,
      business: 29.99,
    };

    let totalMRR = 0;
    const breakdown: Record<string, any> = {};

    subscriptions.forEach((sub: any) => {
      const count = sub._count;
      const price = planPrices[sub.plan] || 0;
      const mrr = count * price;
      totalMRR += mrr;

      breakdown[sub.plan] = {
        subscribers: count,
        pricePerMonth: price,
        monthlyRevenue: mrr,
      };
    });

    // Get affiliate revenue (estimated from clicks)
    const clicks = await prisma.affiliateClick.groupBy({
      by: ['retailer'],
      _count: true,
    });

    let estimatedAffiliateRevenue = 0;
    const affiliateBreakdown: Record<string, any> = {};

    const commissionRates: Record<string, number> = {
      amazon: 0.08,
      ebay: 0.05,
      rockauto: 0.06,
      partsgeek: 0.05,
    };

    clicks.forEach((click: any) => {
      const retailer = click.retailer;
      // Rough estimate: avg order value $50
      const avgOrderValue = 50;
      const commission = commissionRates[retailer] || 0;
      const estimatedRevenue = click._count * avgOrderValue * commission;
      estimatedAffiliateRevenue += estimatedRevenue;

      affiliateBreakdown[retailer] = {
        clicks: click._count,
        estimatedRevenue,
      };
    });

    res.json({
      subscriptionRevenue: {
        mrrTotal: totalMRR,
        breakdown,
      },
      affiliateRevenue: {
        estimatedTotal: estimatedAffiliateRevenue,
        breakdown: affiliateBreakdown,
      },
      totalEstimatedRevenue: totalMRR + estimatedAffiliateRevenue,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch revenue analytics' });
  }
});

/**
 * GET /api/admin/analytics/users
 * Get user engagement analytics
 */
router.get('/analytics/users', isAdmin, async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        createdAt: true,
        vehicles: { select: { id: true } },
        maintenanceRecords: { select: { id: true } },
        priceAlerts: { select: { id: true } },
        userGuides: { select: { id: true } },
        guideRatings: { select: { id: true } },
      },
      take: 100,
    });

    const engagementMetrics = users.map(user => ({
      userId: user.id,
      joinedAt: user.createdAt,
      vehicles: user.vehicles.length,
      maintenanceRecords: user.maintenanceRecords.length,
      priceAlerts: user.priceAlerts.length,
      guidesCreated: user.userGuides.length,
      guidesRated: user.guideRatings.length,
      engagementScore:
        user.vehicles.length * 10 +
        user.maintenanceRecords.length * 5 +
        user.priceAlerts.length * 8 +
        user.userGuides.length * 50 +
        user.guideRatings.length * 10,
    }));

    const avgEngagement = engagementMetrics.reduce((sum, u) => sum + u.engagementScore, 0) / engagementMetrics.length;

    res.json({
      totalEngagingUsers: engagementMetrics.length,
      averageEngagementScore: avgEngagement.toFixed(2),
      topUsers: engagementMetrics
        .sort((a, b) => b.engagementScore - a.engagementScore)
        .slice(0, 10),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user analytics' });
  }
});

/**
 * GET /api/admin/analytics/guides
 * Get guide statistics
 */
router.get('/analytics/guides', isAdmin, async (_req: Request, res: Response) => {
  try {
    const guides = await prisma.userGuide.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        views: true,
        ratings: true,
        createdAt: true,
        user: { select: { name: true } },
      },
      orderBy: { views: 'desc' },
      take: 50,
    });

    const stats = {
      totalGuides: await prisma.userGuide.count(),
      approvedGuides: await prisma.userGuide.count({ where: { status: 'approved' } }),
      pendingGuides: await prisma.userGuide.count({ where: { status: 'pending_review' } }),
      totalViews: guides.reduce((sum, g) => sum + g.views, 0),
      topGuides: guides.slice(0, 10).map(g => ({
        title: g.title,
        author: g.user.name,
        views: g.views,
        avgRating: g.ratings.length > 0
          ? (g.ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / g.ratings.length).toFixed(2)
          : 'N/A',
      })),
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch guide analytics' });
  }
});

// ==========================================
// SYSTEM HEALTH ENDPOINTS
// ==========================================

/**
 * GET /api/admin/health
 * System health check
 */
router.get('/health', isAdmin, async (_req: Request, res: Response) => {
  try {
    const dbCheck = await prisma.user.count().catch(() => -1);

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: dbCheck >= 0 ? 'connected' : 'disconnected',
      uptime: process.uptime(),
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export { router as adminRoutes };
