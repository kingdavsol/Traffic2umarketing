import cron from 'node-cron';
import priceAlertService from '../services/priceAlert.service';

/**
 * Price Alert Cron Job
 *
 * Checks price alerts hourly and sends notifications when prices drop
 * Schedule: Every hour at minute 0 (e.g., 1:00 AM, 2:00 AM, etc.)
 *
 * This job should be started when the server starts if PRICE_ALERTS_ENABLED=true
 */

interface CronJobConfig {
  enabled: boolean;
  schedule: string;
  timezone: string;
}

const config: CronJobConfig = {
  enabled: process.env.FEATURE_PRICE_ALERTS === 'true',
  schedule: process.env.PRICE_ALERT_CRON_SCHEDULE || '0 * * * *', // Every hour
  timezone: process.env.TIMEZONE || 'America/New_York',
};

let job: cron.ScheduledTask | null = null;

/**
 * Start the price alert checking cron job
 */
export const startPriceAlertCron = () => {
  if (!config.enabled) {
    console.log('⏭️  Price alert cron job is disabled');
    return;
  }

  if (job) {
    console.log('⚠️  Price alert cron job is already running');
    return;
  }

  console.log(`📅 Starting price alert cron job (schedule: "${config.schedule}")`);

  job = cron.schedule(config.schedule, async () => {
    try {
      console.log('🔔 Running price alert check...');
      const startTime = Date.now();

      const result = await priceAlertService.checkAndNotifyAlerts();

      const duration = Date.now() - startTime;

      console.log(`✅ Price alert check completed in ${duration}ms`);
      console.log(`   - Checked: ${result.checked} alerts`);
      console.log(`   - Notified: ${result.notified} users`);

      if (result.errors.length > 0) {
        console.warn(`   - Errors: ${result.errors.length}`);
        result.errors.forEach((error) => {
          console.warn(`     • ${error}`);
        });
      }
    } catch (error) {
      console.error('❌ Error in price alert cron job:', error);
    }
  });

  // Optional: Run once on startup after a delay to verify functionality
  console.log('💡 Price alert cron job started successfully');
  console.log(`   Next run: ${job.nextDate().toString()}`);
};

/**
 * Stop the price alert checking cron job
 */
export const stopPriceAlertCron = () => {
  if (!job) {
    console.log('⚠️  Price alert cron job is not running');
    return;
  }

  job.stop();
  job = null;

  console.log('⏹️  Price alert cron job stopped');
};

/**
 * Get current cron job status
 */
export const getPriceAlertCronStatus = () => {
  return {
    enabled: config.enabled,
    running: job !== null,
    schedule: config.schedule,
    timezone: config.timezone,
    nextRun: job ? job.nextDate().toString() : null,
  };
};

/**
 * Manually trigger price alert check (useful for testing/admin endpoints)
 */
export const triggerPriceAlertCheck = async () => {
  try {
    console.log('🔔 Manual price alert check triggered');
    const result = await priceAlertService.checkAndNotifyAlerts();
    return result;
  } catch (error) {
    console.error('❌ Error in manual price alert check:', error);
    throw error;
  }
};

export default {
  startPriceAlertCron,
  stopPriceAlertCron,
  getPriceAlertCronStatus,
  triggerPriceAlertCheck,
};
