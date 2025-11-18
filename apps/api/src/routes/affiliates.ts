import { Router, Response, Request } from 'express';
import affiliateService from '../services/affiliate.service';
import { authenticate, AuthRequest } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /api/affiliates/link
 * Generate affiliate link for a part
 */
router.get(
  '/link',
  asyncHandler(async (req: Request, res: Response) => {
    const { partName, retailer, partId } = req.query;

    if (!partName || !retailer) {
      throw new AppError(400, 'Part name and retailer are required');
    }

    const link = affiliateService.generateAffiliateLink(
      partName as string,
      retailer as string,
      partId as string
    );

    if (!link.url) {
      throw new AppError(400, 'Invalid retailer');
    }

    // Track click if user is logged in
    if (req.query.userId) {
      await affiliateService.trackClick(
        partId as string,
        retailer as string,
        link.url,
        req.query.userId as string,
        req.ip
      );
    }

    res.json({
      success: true,
      data: link,
      message: 'Successfully generated affiliate link'
    });
  })
);

/**
 * GET /api/affiliates/earnings
 * Get user's affiliate earnings
 */
router.get(
  '/earnings',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const earnings = await affiliateService.getEarnings(req.userId!);

    res.json({
      success: true,
      data: earnings,
      message: 'Successfully retrieved affiliate earnings'
    });
  })
);

/**
 * POST /api/affiliates/conversion
 * Record affiliate conversion (from payment system)
 */
router.post(
  '/conversion',
  asyncHandler(async (req: Request, res: Response) => {
    const { clickId, earnings } = req.body;

    if (!clickId || earnings === undefined) {
      throw new AppError(400, 'Click ID and earnings are required');
    }

    await affiliateService.recordConversion(clickId, earnings);

    res.json({
      success: true,
      message: 'Conversion recorded successfully'
    });
  })
);

/**
 * GET /api/affiliates/commission/:retailer
 * Get commission rate for a retailer
 */
router.get(
  '/commission/:retailer',
  asyncHandler(async (req: Request, res: Response) => {
    const { retailer } = req.params;

    const commission = affiliateService.getCommissionRate(retailer);

    if (commission === 0) {
      throw new AppError(400, 'Unknown retailer');
    }

    res.json({
      success: true,
      data: {
        retailer,
        commission,
        percentage: `${(commission * 100).toFixed(1)}%`
      },
      message: 'Successfully retrieved commission rate'
    });
  })
);

/**
 * GET /api/affiliates/estimate
 * Estimate earnings for a price
 */
router.get(
  '/estimate',
  asyncHandler(async (req: Request, res: Response) => {
    const { price, retailer } = req.query;

    if (!price || !retailer) {
      throw new AppError(400, 'Price and retailer are required');
    }

    const priceNum = parseInt(price as string); // in cents
    const earnings = affiliateService.calculateEstimatedEarnings(priceNum, retailer as string);

    res.json({
      success: true,
      data: {
        price: (priceNum / 100).toFixed(2),
        retailer,
        estimatedEarnings: (earnings / 100).toFixed(2),
        commission: `${(affiliateService.getCommissionRate(retailer as string) * 100).toFixed(1)}%`
      },
      message: 'Successfully calculated estimated earnings'
    });
  })
);

/**
 * GET /api/affiliates/stats (admin)
 * Get global affiliate statistics
 */
router.get(
  '/stats',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    // TODO: Check if user is admin
    const stats = await affiliateService.getGlobalStats();

    res.json({
      success: true,
      data: stats,
      message: 'Successfully retrieved affiliate statistics'
    });
  })
);

export { router as affiliateRoutes };
