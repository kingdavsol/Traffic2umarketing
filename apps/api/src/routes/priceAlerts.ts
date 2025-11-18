import { Router, Response } from 'express';
import priceAlertService from '../services/priceAlert.service';
import { authenticate, AuthRequest } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';

const router = Router();

/**
 * POST /api/price-alerts/create
 * Create a new price alert
 */
router.post(
  '/create',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { partId, targetPrice, emailAlert = true, smsAlert = false } = req.body;

    if (!partId || targetPrice === undefined) {
      throw new AppError(400, 'Part ID and target price are required');
    }

    const alert = await priceAlertService.createPriceAlert(
      req.userId!,
      partId,
      targetPrice,
      emailAlert,
      smsAlert
    );

    res.status(201).json({
      success: true,
      data: alert,
      message: 'Price alert created successfully! We\'ll notify you when the price drops.'
    });
  })
);

/**
 * GET /api/price-alerts
 * Get user's price alerts
 */
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const alerts = await priceAlertService.getUserAlerts(req.userId!);

    res.json({
      success: true,
      data: alerts,
      count: alerts.length,
      message: 'Successfully retrieved price alerts'
    });
  })
);

/**
 * DELETE /api/price-alerts/:alertId
 * Deactivate a price alert
 */
router.delete(
  '/:alertId',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { alertId } = req.params;

    await priceAlertService.deactivateAlert(alertId, req.userId!);

    res.json({
      success: true,
      message: 'Price alert deactivated successfully'
    });
  })
);

/**
 * POST /api/price-alerts/check-all
 * Check all alerts and send notifications (admin/cron job)
 */
router.post(
  '/check-all',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    // TODO: Verify this is called from authorized cron job
    const results = await priceAlertService.checkAndNotifyAlerts();

    res.json({
      success: true,
      data: results,
      message: `Checked ${results.checked} alerts, sent ${results.notified} notifications`
    });
  })
);

/**
 * GET /api/price-alerts/stats
 * Get price alert statistics
 */
router.get(
  '/stats',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const stats = await priceAlertService.getStats();

    res.json({
      success: true,
      data: stats,
      message: 'Successfully retrieved price alert statistics'
    });
  })
);

export { router as priceAlertRoutes };
