import { Router, Response, Request } from 'express';
import nhtsaService from '../services/nhtsa.service';
import { vehicleCache, cacheKeys, CACHE_TTL } from '../utils/cache';
import { asyncHandler, AppError } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /api/nhtsa/makes
 * Get all vehicle makes
 */
router.get(
  '/makes',
  asyncHandler(async (req: Request, res: Response) => {
    const cacheKey = 'nhtsa_all_makes';
    let makes = vehicleCache.get(cacheKey);

    if (!makes) {
      makes = await nhtsaService.getMakes();
      vehicleCache.set(cacheKey, makes, CACHE_TTL.VERY_LONG);
    }

    res.set('Cache-Control', 'public, max-age=604800'); // 7 days
    res.json({
      success: true,
      data: makes,
      count: makes.length,
      message: 'Successfully retrieved all vehicle makes'
    });
  })
);

/**
 * GET /api/nhtsa/makes/popular
 * Get popular vehicle makes for performance
 */
router.get(
  '/makes/popular',
  asyncHandler(async (req: Request, res: Response) => {
    const cacheKey = 'nhtsa_popular_makes';
    let makes = vehicleCache.get(cacheKey);

    if (!makes) {
      makes = await nhtsaService.getPopularMakes();
      vehicleCache.set(cacheKey, makes, CACHE_TTL.VERY_LONG);
    }

    res.set('Cache-Control', 'public, max-age=604800'); // 7 days
    res.json({
      success: true,
      data: makes,
      count: makes.length,
      message: 'Successfully retrieved popular vehicle makes'
    });
  })
);

/**
 * GET /api/nhtsa/models
 * Get models for a specific make and year
 * Query params: ?make=Toyota&year=2023
 */
router.get(
  '/models',
  asyncHandler(async (req: Request, res: Response) => {
    const { make, year } = req.query;

    if (!make || !year) {
      throw new AppError(400, 'Make and year are required query parameters');
    }

    const yearNum = parseInt(year as string);
    if (isNaN(yearNum) || yearNum < 1980 || yearNum > new Date().getFullYear() + 1) {
      throw new AppError(400, 'Invalid year - must be between 1980 and current year');
    }

    const cacheKey = cacheKeys.vehicle(make as string, 'all-models', yearNum);
    let models = vehicleCache.get(cacheKey);

    if (!models) {
      models = await nhtsaService.getModelsForMakeYear(make as string, yearNum);
      vehicleCache.set(cacheKey, models, CACHE_TTL.VERY_LONG);
    }

    res.set('Cache-Control', 'public, max-age=604800'); // 7 days
    res.json({
      success: true,
      data: models,
      count: models.length,
      make,
      year: yearNum,
      message: `Successfully retrieved ${make} models for ${yearNum}`
    });
  })
);

/**
 * GET /api/nhtsa/details
 * Get detailed specifications for a vehicle
 * Query params: ?make=Toyota&model=Camry&year=2023
 */
router.get(
  '/details',
  asyncHandler(async (req: Request, res: Response) => {
    const { make, model, year } = req.query;

    if (!make || !model || !year) {
      throw new AppError(400, 'Make, model, and year are required query parameters');
    }

    const yearNum = parseInt(year as string);
    if (isNaN(yearNum) || yearNum < 1980 || yearNum > new Date().getFullYear() + 1) {
      throw new AppError(400, 'Invalid year');
    }

    const cacheKey = cacheKeys.vehicle(make as string, model as string, yearNum);
    let details = vehicleCache.get(cacheKey);

    if (!details) {
      const rawDetails = await nhtsaService.getVehicleDetails(
        make as string,
        model as string,
        yearNum
      );

      if (!rawDetails || rawDetails.length === 0) {
        throw new AppError(404, `No vehicle found for ${yearNum} ${make} ${model}`);
      }

      const parsed = nhtsaService.parseVehicleDetails(rawDetails);
      const specs = nhtsaService.extractVehicleSpecs(parsed);

      details = {
        vehicle: {
          year: yearNum,
          make,
          model
        },
        specs,
        allDetails: parsed,
        rawCount: rawDetails.length
      };

      vehicleCache.set(cacheKey, details, CACHE_TTL.VERY_LONG);
    }

    res.set('Cache-Control', 'public, max-age=604800'); // 7 days
    res.json({
      success: true,
      data: details,
      message: `Successfully retrieved specifications for ${yearNum} ${make} ${model}`
    });
  })
);

/**
 * GET /api/nhtsa/complaints
 * Get safety complaints for a vehicle
 * Query params: ?make=Toyota&model=Camry&year=2023
 */
router.get(
  '/complaints',
  asyncHandler(async (req: Request, res: Response) => {
    const { make, model, year } = req.query;

    if (!make) {
      throw new AppError(400, 'Make is required');
    }

    const yearNum = year ? parseInt(year as string) : undefined;
    if (year && (isNaN(yearNum!) || yearNum! < 1980)) {
      throw new AppError(400, 'Invalid year');
    }

    const cacheKey = `nhtsa_complaints_${make}_${model || 'all'}_${yearNum || 'all'}`;
    let complaints = vehicleCache.get(cacheKey);

    if (!complaints) {
      complaints = await nhtsaService.getComplaints(
        make as string,
        model as string | undefined,
        yearNum
      );
      vehicleCache.set(cacheKey, complaints, CACHE_TTL.LONG);
    }

    res.set('Cache-Control', 'public, max-age=86400'); // 1 day
    res.json({
      success: true,
      data: complaints,
      count: complaints.length,
      filters: { make, model: model || undefined, year: yearNum || undefined },
      message: `Found ${complaints.length} complaint(s) for ${make} ${model || ''}`
    });
  })
);

/**
 * GET /api/nhtsa/recalls
 * Get safety recalls for a vehicle
 * Query params: ?make=Toyota&model=Camry&year=2023
 */
router.get(
  '/recalls',
  asyncHandler(async (req: Request, res: Response) => {
    const { make, model, year } = req.query;

    if (!make) {
      throw new AppError(400, 'Make is required');
    }

    const yearNum = year ? parseInt(year as string) : undefined;
    if (year && (isNaN(yearNum!) || yearNum! < 1980)) {
      throw new AppError(400, 'Invalid year');
    }

    const cacheKey = `nhtsa_recalls_${make}_${model || 'all'}_${yearNum || 'all'}`;
    let recalls = vehicleCache.get(cacheKey);

    if (!recalls) {
      recalls = await nhtsaService.getRecalls(
        make as string,
        model as string | undefined,
        yearNum
      );
      vehicleCache.set(cacheKey, recalls, CACHE_TTL.LONG);
    }

    res.set('Cache-Control', 'public, max-age=86400'); // 1 day
    res.json({
      success: true,
      data: recalls,
      count: recalls.length,
      filters: { make, model: model || undefined, year: yearNum || undefined },
      message: `Found ${recalls.length} recall(s) for ${make} ${model || ''}`
    });
  })
);

/**
 * GET /api/nhtsa/vehicle/:year/:make/:model
 * Get complete vehicle information (specs, complaints, recalls)
 */
router.get(
  '/vehicle/:year/:make/:model',
  asyncHandler(async (req: Request, res: Response) => {
    const { year, make, model } = req.params;

    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 1980 || yearNum > new Date().getFullYear() + 1) {
      throw new AppError(400, 'Invalid year');
    }

    if (!make || !model) {
      throw new AppError(400, 'Make and model are required');
    }

    try {
      // Get all data in parallel for performance
      const [details, complaints, recalls] = await Promise.all([
        nhtsaService.getVehicleDetails(make, model, yearNum),
        nhtsaService.getComplaints(make, model, yearNum),
        nhtsaService.getRecalls(make, model, yearNum)
      ]);

      if (!details || details.length === 0) {
        throw new AppError(404, `Vehicle not found: ${yearNum} ${make} ${model}`);
      }

      const parsed = nhtsaService.parseVehicleDetails(details);
      const specs = nhtsaService.extractVehicleSpecs(parsed);

      const vehicleData = {
        vehicle: {
          year: yearNum,
          make,
          model
        },
        specifications: specs,
        problems: {
          complaints: {
            count: complaints.length,
            data: complaints.slice(0, 10) // Return top 10
          },
          recalls: {
            count: recalls.length,
            data: recalls.slice(0, 10) // Return top 10
          }
        },
        summary: {
          totalComplaints: complaints.length,
          totalRecalls: recalls.length,
          hasKnownIssues: complaints.length > 0 || recalls.length > 0
        }
      };

      res.set('Cache-Control', 'public, max-age=604800'); // 7 days
      res.json({
        success: true,
        data: vehicleData,
        message: `Successfully retrieved complete information for ${yearNum} ${make} ${model}`
      });
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new AppError(404, `Vehicle not found: ${yearNum} ${make} ${model}`);
      }
      throw error;
    }
  })
);

/**
 * GET /api/nhtsa/search
 * Search for vehicles by make and optional model/year
 * Query params: ?make=Toyota&model=Camry (optional)&year=2023 (optional)
 */
router.get(
  '/search',
  asyncHandler(async (req: Request, res: Response) => {
    const { make, model, year } = req.query;

    if (!make) {
      throw new AppError(400, 'Make is required');
    }

    let results: any = null;

    if (year && model) {
      // Get specific vehicle
      const yearNum = parseInt(year as string);
      const details = await nhtsaService.getVehicleDetails(make as string, model as string, yearNum);
      if (details.length > 0) {
        results = {
          type: 'vehicle',
          vehicle: { year: yearNum, make, model },
          found: true
        };
      }
    } else if (year) {
      // Get all models for make and year
      const yearNum = parseInt(year as string);
      const models = await nhtsaService.getModelsForMakeYear(make as string, yearNum);
      results = {
        type: 'models',
        make,
        year: yearNum,
        models,
        count: models.length
      };
    } else {
      // Get years available for make/model
      results = {
        type: 'make',
        make,
        message: 'Provide year for available models'
      };
    }

    res.json({
      success: true,
      data: results
    });
  })
);

/**
 * GET /api/nhtsa/cache/status
 * Get cache status (admin endpoint)
 */
router.get(
  '/cache/status',
  asyncHandler(async (req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        cacheSize: vehicleCache.size(),
        message: 'Cache system operational'
      }
    });
  })
);

/**
 * POST /api/nhtsa/cache/clear
 * Clear cache (admin endpoint)
 */
router.post(
  '/cache/clear',
  asyncHandler(async (req: Request, res: Response) => {
    vehicleCache.clear();
    nhtsaService.clearCache();

    res.json({
      success: true,
      message: 'Cache cleared successfully'
    });
  })
);

export { router as nhtsaRoutes };
