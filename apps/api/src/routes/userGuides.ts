import { Router, Response } from 'express';
import userGuideService from '../services/userGuide.service';
import { authenticate, AuthRequest } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';

const router = Router();

/**
 * POST /api/guides/create
 * Create a new user-generated guide
 */
router.post(
  '/create',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { title, description, content, vehicleMake, vehicleModel, vehicleYear, category, difficulty, estimatedTime, steps, tools, partsNeeded, videoUrl, imageUrl } = req.body;

    if (!title || !description || !content) {
      throw new AppError(400, 'Title, description, and content are required');
    }

    if (!vehicleMake || !vehicleModel) {
      throw new AppError(400, 'Vehicle make and model are required');
    }

    const guide = await userGuideService.createGuide(req.userId!, {
      title,
      description,
      content,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      category: category || 'repair',
      difficulty: difficulty || 'medium',
      estimatedTime,
      steps: steps || [],
      tools: tools || [],
      partsNeeded: partsNeeded || [],
      videoUrl,
      imageUrl
    });

    res.status(201).json({
      success: true,
      data: guide,
      message: 'Guide submitted successfully! Thanks for contributing. It will be reviewed before appearing publicly.'
    });
  })
);

/**
 * GET /api/guides/vehicle/:make/:model
 * Get guides for a specific vehicle
 */
router.get(
  '/vehicle/:make/:model',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { make, model } = req.params;
    const { year, category } = req.query;

    const guides = await userGuideService.getGuidesForVehicle(
      make,
      model,
      year ? parseInt(year as string) : undefined,
      category as string
    );

    res.json({
      success: true,
      data: guides,
      count: guides.length,
      message: `Found ${guides.length} guides for ${year || ''} ${make} ${model}`
    });
  })
);

/**
 * GET /api/guides/:guideId
 * Get a specific guide (with view tracking)
 */
router.get(
  '/:guideId',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { guideId } = req.params;

    const guide = await userGuideService.getGuide(guideId, req.userId);

    if (!guide) {
      throw new AppError(404, 'Guide not found');
    }

    res.json({
      success: true,
      data: guide,
      message: 'Successfully retrieved guide'
    });
  })
);

/**
 * GET /api/guides/featured
 * Get featured guides
 */
router.get(
  '/featured',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { limit = '10' } = req.query;

    const guides = await userGuideService.getFeaturedGuides(parseInt(limit as string));

    res.json({
      success: true,
      data: guides,
      count: guides.length,
      message: 'Successfully retrieved featured guides'
    });
  })
);

/**
 * POST /api/guides/:guideId/rate
 * Rate a guide
 */
router.post(
  '/:guideId/rate',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { guideId } = req.params;
    const { helpful, rating, comment } = req.body;

    if (helpful === undefined) {
      throw new AppError(400, 'Helpful flag is required');
    }

    if (rating && (rating < 1 || rating > 5)) {
      throw new AppError(400, 'Rating must be between 1 and 5');
    }

    await userGuideService.rateGuide(req.userId!, guideId, helpful, rating, comment);

    res.json({
      success: true,
      message: `Thanks for ${helpful ? 'rating' : 'providing feedback on'} this guide!`
    });
  })
);

/**
 * GET /api/guides/user/:userId
 * Get user's guides
 */
router.get(
  '/user/:userId',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;

    const guides = await userGuideService.getUserGuides(userId);

    res.json({
      success: true,
      data: guides,
      count: guides.length,
      message: 'Successfully retrieved user guides'
    });
  })
);

/**
 * POST /api/guides/:guideId/approve (admin)
 * Approve a guide
 */
router.post(
  '/:guideId/approve',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    // TODO: Check if user is admin
    const { guideId } = req.params;

    await userGuideService.approveGuide(guideId);

    res.json({
      success: true,
      message: 'Guide approved successfully!'
    });
  })
);

/**
 * POST /api/guides/:guideId/feature (admin)
 * Feature a guide
 */
router.post(
  '/:guideId/feature',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    // TODO: Check if user is admin
    const { guideId } = req.params;

    await userGuideService.featureGuide(guideId);

    res.json({
      success: true,
      message: 'Guide featured successfully!'
    });
  })
);

/**
 * GET /api/guides/points/:userId
 * Get user's points
 */
router.get(
  '/points/:userId',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;

    const points = await userGuideService.getUserPoints(userId);

    res.json({
      success: true,
      data: { points },
      message: 'Successfully retrieved user points'
    });
  })
);

/**
 * POST /api/guides/points/redeem
 * Redeem points for discount
 */
router.post(
  '/points/redeem',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { points } = req.body;

    if (!points || points < 100) {
      throw new AppError(400, 'Minimum 100 points required');
    }

    const discount = await userGuideService.redeemPoints(req.userId!, points);

    res.json({
      success: true,
      data: discount,
      message: `Redeemed ${points} points for $${discount.discountAmount} discount!`
    });
  })
);

/**
 * GET /api/guides/stats
 * Get guide statistics
 */
router.get(
  '/stats',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const stats = await userGuideService.getStats();

    res.json({
      success: true,
      data: stats,
      message: 'Successfully retrieved guide statistics'
    });
  })
);

export { router as userGuideRoutes };
