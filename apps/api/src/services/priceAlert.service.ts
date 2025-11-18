import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// Configure email transport
const emailTransporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

class PriceAlertService {
  /**
   * Create a price alert for a user
   */
  async createPriceAlert(
    userId: string,
    partId: string,
    targetPrice: number, // in cents
    emailAlert: boolean = true,
    smsAlert: boolean = false
  ): Promise<any> {
    // Check if part exists
    const part = await prisma.part.findUnique({
      where: { id: partId }
    });

    if (!part) {
      throw new Error('Part not found');
    }

    // Check if user already has alert for this part
    const existing = await prisma.priceAlert.findFirst({
      where: {
        userId,
        partId,
        isActive: true
      }
    });

    if (existing) {
      throw new Error('You already have an active alert for this part');
    }

    return await prisma.priceAlert.create({
      data: {
        userId,
        partId,
        targetPrice,
        emailAlert,
        smsAlert
      }
    });
  }

  /**
   * Get user's active price alerts
   */
  async getUserAlerts(userId: string): Promise<any[]> {
    return await prisma.priceAlert.findMany({
      where: {
        userId,
        isActive: true
      },
      include: {
        part: {
          include: {
            priceListings: {
              orderBy: { totalPrice: 'asc' },
              take: 1
            }
          }
        }
      }
    });
  }

  /**
   * Deactivate a price alert
   */
  async deactivateAlert(alertId: string, userId: string): Promise<void> {
    const alert = await prisma.priceAlert.findUnique({
      where: { id: alertId }
    });

    if (!alert || alert.userId !== userId) {
      throw new Error('Alert not found');
    }

    await prisma.priceAlert.update({
      where: { id: alertId },
      data: { isActive: false }
    });
  }

  /**
   * Check all active alerts and send notifications
   * This should be run periodically (e.g., every hour)
   */
  async checkAndNotifyAlerts(): Promise<{
    checked: number;
    notified: number;
    errors: string[];
  }> {
    const alerts = await prisma.priceAlert.findMany({
      where: { isActive: true },
      include: {
        part: {
          include: {
            priceListings: {
              orderBy: { totalPrice: 'asc' }
            }
          }
        },
        user: true
      }
    });

    let notified = 0;
    const errors: string[] = [];

    for (const alert of alerts) {
      try {
        if (alert.part.priceListings.length === 0) {
          continue;
        }

        const lowestPrice = alert.part.priceListings[0].totalPrice;
        const lowestListing = alert.part.priceListings[0];

        // Check if price has dropped to target or below
        if (lowestPrice <= alert.targetPrice) {
          const notificationsSent = [];

          // Send email alert
          if (alert.emailAlert && alert.user?.email) {
            try {
              await this.sendEmailAlert(
                alert.user.email,
                alert.part,
                lowestPrice,
                lowestListing.retailer,
                lowestListing.url
              );
              notificationsSent.push('email');
            } catch (err) {
              errors.push(`Failed to send email for alert ${alert.id}: ${err}`);
            }
          }

          // Send SMS alert (if integrated)
          if (alert.smsAlert && alert.user?.phone) {
            try {
              await this.sendSmsAlert(alert.user.phone, alert.part, lowestPrice);
              notificationsSent.push('sms');
            } catch (err) {
              errors.push(`Failed to send SMS for alert ${alert.id}: ${err}`);
            }
          }

          // Mark alert as notified
          if (notificationsSent.length > 0) {
            await prisma.priceAlert.update({
              where: { id: alert.id },
              data: { notifiedAt: new Date() }
            });

            notified++;
          }
        }
      } catch (err) {
        errors.push(`Error processing alert ${alert.id}: ${err}`);
      }
    }

    return {
      checked: alerts.length,
      notified,
      errors
    };
  }

  /**
   * Send email alert
   */
  private async sendEmailAlert(
    email: string,
    part: any,
    price: number,
    retailer: string,
    url: string
  ): Promise<void> {
    const priceFormatted = (price / 100).toFixed(2);
    const targetPrice = (part.estimatedCost / 100).toFixed(2);

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2 style="color: #2c3e50;">⚡ Price Alert: Great Deal Found!</h2>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${part.name}</h3>
          <p style="margin: 10px 0;">
            <strong>Price:</strong> <span style="color: #27ae60; font-size: 24px;">$${priceFormatted}</span>
            <br/>
            <strong>Your target:</strong> $${targetPrice}
            <br/>
            <strong>Savings:</strong> ${((targetPrice - priceFormatted) * 100).toFixed(0)}%
          </p>
        </div>

        <div style="margin: 20px 0;">
          <p>This part is now available on ${retailer} at the price you wanted!</p>
          <a href="${url}" style="display: inline-block; background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Buy Now on ${retailer}
          </a>
        </div>

        <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px;">
          Don't want these alerts anymore? You can manage your alerts in your Car Maintenance Hub account.
        </p>
      </div>
    `;

    await emailTransporter.sendMail({
      to: email,
      subject: `⚡ Price Drop Alert: ${part.name} - Now $${priceFormatted}!`,
      html: htmlContent
    });
  }

  /**
   * Send SMS alert (placeholder - implement with Twilio)
   */
  private async sendSmsAlert(phone: string, part: any, price: number): Promise<void> {
    const priceFormatted = (price / 100).toFixed(2);

    const message = `🚗 Car Hub: ${part.name} is now $${priceFormatted}! This is the price you wanted. Check it out: ${process.env.APP_URL}/parts/${part.id}`;

    // TODO: Integrate with Twilio or another SMS provider
    console.log(`[SMS] ${phone}: ${message}`);
  }

  /**
   * Get alert statistics
   */
  async getStats(): Promise<{
    totalAlerts: number;
    activeAlerts: number;
    alertsByPart: Record<string, number>;
    recentNotifications: number;
  }> {
    const allAlerts = await prisma.priceAlert.findMany();
    const activeAlerts = allAlerts.filter(a => a.isActive);

    // Group by part
    const alertsByPart: Record<string, number> = {};
    for (const alert of activeAlerts) {
      alertsByPart[alert.partId] = (alertsByPart[alert.partId] || 0) + 1;
    }

    // Get recent notifications
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentNotifications = allAlerts.filter(
      a => a.notifiedAt && new Date(a.notifiedAt) > thirtyDaysAgo
    ).length;

    return {
      totalAlerts: allAlerts.length,
      activeAlerts: activeAlerts.length,
      alertsByPart,
      recentNotifications
    };
  }

  /**
   * Delete old inactive alerts (cleanup)
   */
  async cleanupOldAlerts(daysOld: number = 90): Promise<number> {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

    const deleted = await prisma.priceAlert.deleteMany({
      where: {
        isActive: false,
        updatedAt: { lt: cutoffDate }
      }
    });

    return deleted.count;
  }
}

export default new PriceAlertService();
