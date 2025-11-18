import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AffiliateLink {
  url: string;
  retailer: string;
}

class AffiliateService {
  // Affiliate configuration
  private affiliateConfig = {
    amazon: {
      baseUrl: 'https://www.amazon.com/s',
      trackingId: process.env.AMAZON_ASSOCIATE_ID || 'carhub-20',
      commission: 0.08 // 8%
    },
    ebay: {
      baseUrl: 'https://www.ebay.com/sch/i.html',
      partnerId: process.env.EBAY_PARTNER_ID || 'carhub',
      commission: 0.05 // 5%
    },
    rockauto: {
      baseUrl: 'https://www.rockauto.com',
      commission: 0.06 // 6%
    },
    partsgeek: {
      baseUrl: 'https://www.partsgeek.com/search.php',
      commission: 0.05 // 5%
    }
  };

  /**
   * Generate affiliate link for a part
   */
  generateAffiliateLink(partName: string, retailer: string, partId?: string): AffiliateLink {
    const config = this.affiliateConfig[retailer as keyof typeof this.affiliateConfig];

    if (!config) {
      return { url: '', retailer };
    }

    let url = '';

    switch (retailer) {
      case 'amazon':
        url = `${config.baseUrl}?k=${encodeURIComponent(partName)}&tag=${config.trackingId}`;
        break;
      case 'ebay':
        url = `${config.baseUrl}?_nkw=${encodeURIComponent(partName)}&partnerId=${config.partnerId}`;
        break;
      case 'rockauto':
        url = config.baseUrl;
        break;
      case 'partsgeek':
        url = `${config.baseUrl}?q=${encodeURIComponent(partName)}`;
        break;
      default:
        url = '';
    }

    return { url, retailer };
  }

  /**
   * Track affiliate click
   */
  async trackClick(
    partId: string,
    retailer: string,
    url: string,
    userId?: string,
    ipAddress?: string
  ): Promise<void> {
    await prisma.affiliateClick.create({
      data: {
        partId,
        retailer,
        url,
        userId: userId || undefined,
        ipAddress: ipAddress || undefined
      }
    });
  }

  /**
   * Record affiliate conversion
   */
  async recordConversion(
    clickId: string,
    earnings: number // in cents
  ): Promise<void> {
    await prisma.affiliateClick.update({
      where: { id: clickId },
      data: {
        conversions: { increment: 1 },
        earnings: { increment: earnings }
      }
    });
  }

  /**
   * Get affiliate earnings for a user
   */
  async getEarnings(userId: string): Promise<{
    totalClicks: number;
    totalConversions: number;
    totalEarnings: number;
    byRetailer: Record<string, any>;
  }> {
    const clicks = await prisma.affiliateClick.findMany({
      where: { userId }
    });

    const byRetailer: Record<string, any> = {};

    for (const click of clicks) {
      if (!byRetailer[click.retailer]) {
        byRetailer[click.retailer] = {
          clicks: 0,
          conversions: 0,
          earnings: 0
        };
      }

      byRetailer[click.retailer].clicks += 1;
      byRetailer[click.retailer].conversions += click.conversions;
      byRetailer[click.retailer].earnings += click.earnings;
    }

    const totalEarnings = clicks.reduce((sum, click) => sum + click.earnings, 0);
    const totalConversions = clicks.reduce((sum, click) => sum + click.conversions, 0);

    return {
      totalClicks: clicks.length,
      totalConversions,
      totalEarnings,
      byRetailer
    };
  }

  /**
   * Get global affiliate statistics (admin)
   */
  async getGlobalStats(): Promise<{
    totalClicks: number;
    totalConversions: number;
    totalEarnings: number;
    topRetailers: Array<{ retailer: string; clicks: number; earnings: number }>;
    topParts: Array<{ partId: string; partName: string; clicks: number; earnings: number }>;
  }> {
    const clicks = await prisma.affiliateClick.findMany({
      include: { part: true }
    });

    const totalEarnings = clicks.reduce((sum, click) => sum + click.earnings, 0);
    const totalConversions = clicks.reduce((sum, click) => sum + click.conversions, 0);

    // Group by retailer
    const byRetailer: Record<string, any> = {};
    for (const click of clicks) {
      if (!byRetailer[click.retailer]) {
        byRetailer[click.retailer] = { clicks: 0, earnings: 0 };
      }
      byRetailer[click.retailer].clicks += 1;
      byRetailer[click.retailer].earnings += click.earnings;
    }

    const topRetailers = Object.entries(byRetailer)
      .map(([retailer, data]) => ({
        retailer,
        clicks: data.clicks,
        earnings: data.earnings
      }))
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 10);

    // Group by part
    const byPart: Record<string, any> = {};
    for (const click of clicks) {
      if (!byPart[click.partId]) {
        byPart[click.partId] = { clicks: 0, earnings: 0, partName: click.part?.name || 'Unknown' };
      }
      byPart[click.partId].clicks += 1;
      byPart[click.partId].earnings += click.earnings;
    }

    const topParts = Object.entries(byPart)
      .map(([partId, data]) => ({
        partId,
        partName: data.partName,
        clicks: data.clicks,
        earnings: data.earnings
      }))
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 10);

    return {
      totalClicks: clicks.length,
      totalConversions,
      totalEarnings,
      topRetailers,
      topParts
    };
  }

  /**
   * Get commission rate for a retailer
   */
  getCommissionRate(retailer: string): number {
    const config = this.affiliateConfig[retailer as keyof typeof this.affiliateConfig];
    return config?.commission || 0;
  }

  /**
   * Calculate estimated earnings
   */
  calculateEstimatedEarnings(price: number, retailer: string): number {
    const commission = this.getCommissionRate(retailer);
    return Math.round(price * commission);
  }
}

export default new AffiliateService();
