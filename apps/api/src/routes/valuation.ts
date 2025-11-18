import { Router, Response, Request } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, AppError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// Get vehicle valuation
router.get(
  '/:make/:model/:year',
  asyncHandler(async (req: Request, res: Response) => {
    const { make, model, year } = req.params;
    const { mileage, condition = 'good', trim } = req.query;

    if (!mileage) {
      throw new AppError(400, 'Mileage is required');
    }

    const mileageNum = parseInt(mileage as string);

    const valuation = await prisma.vehicleValuation.findUnique({
      where: {
        vehicleYear_vehicleMake_vehicleModel_vehicleTrim_mileage: {
          vehicleYear: parseInt(year),
          vehicleMake: make,
          vehicleModel: model,
          vehicleTrim: (trim as string) || '',
          mileage: mileageNum
        }
      }
    });

    if (!valuation) {
      // Return estimated calculation based on year, mileage, and condition
      const age = new Date().getFullYear() - parseInt(year);
      const baseValue = 25000; // Base estimate

      // Depreciation calculation
      let depreciationRate = 0.15;
      if (age > 10) depreciationRate = 0.08;
      else if (age > 5) depreciationRate = 0.12;

      // Mileage depreciation (per 1000 miles)
      let mileageDeduction = (mileageNum / 1000) * 10;

      // Condition adjustment
      const conditionMultiplier: any = {
        poor: 0.7,
        fair: 0.85,
        good: 1.0,
        excellent: 1.15
      };

      let estimatedValue = baseValue;
      for (let i = 0; i < age; i++) {
        estimatedValue *= (1 - depreciationRate);
      }
      estimatedValue -= mileageDeduction;
      estimatedValue *= (conditionMultiplier[condition as string] || 1.0);

      return res.json({
        success: true,
        data: {
          estimatedValue: Math.max(1000, Math.round(estimatedValue)),
          priceRange: {
            low: Math.max(500, Math.round(estimatedValue * 0.9)),
            high: Math.round(estimatedValue * 1.1)
          },
          source: 'estimated',
          age,
          mileage: mileageNum,
          condition,
          note: 'This is an estimated value. For accurate valuations, check KBB, Edmunds, or NADA guides.'
        }
      });
    }

    res.json({
      success: true,
      data: {
        estimatedValue: valuation.estimatedValue,
        priceRange: {
          low: valuation.priceRangeLow || valuation.estimatedValue * 0.9,
          high: valuation.priceRangeHigh || valuation.estimatedValue * 1.1
        },
        source: valuation.source,
        updatedAt: valuation.updatedAt
      }
    });
  })
);

// Get valuation history
router.get(
  '/history/:make/:model/:year',
  asyncHandler(async (req: Request, res: Response) => {
    const { make, model, year } = req.params;
    const { mileageRange = '10000' } = req.query;

    const mileageStep = parseInt(mileageRange as string);

    const valuations = await prisma.vehicleValuation.findMany({
      where: {
        vehicleYear: parseInt(year),
        vehicleMake: make,
        vehicleModel: model
      },
      orderBy: { mileage: 'asc' },
      take: 50
    });

    if (valuations.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: 'No valuation data available. Try checking Kelley Blue Book, Edmunds, or NADA guides.'
      });
    }

    res.json({
      success: true,
      data: valuations,
      summary: {
        lowestValue: Math.min(...valuations.map(v => v.estimatedValue)),
        highestValue: Math.max(...valuations.map(v => v.estimatedValue)),
        averageValue: Math.round(
          valuations.reduce((acc, v) => acc + v.estimatedValue, 0) / valuations.length
        ),
        mileageRange: {
          min: Math.min(...valuations.map(v => v.mileage)),
          max: Math.max(...valuations.map(v => v.mileage))
        }
      }
    });
  })
);

// Compare vehicles
router.post(
  '/compare',
  asyncHandler(async (req: Request, res: Response) => {
    const { vehicles } = req.body;

    if (!Array.isArray(vehicles) || vehicles.length < 2) {
      throw new AppError(400, 'At least 2 vehicles required for comparison');
    }

    const comparisons = await Promise.all(
      vehicles.map(async (vehicle: any) => {
        const valuation = await prisma.vehicleValuation.findFirst({
          where: {
            vehicleYear: vehicle.year,
            vehicleMake: vehicle.make,
            vehicleModel: vehicle.model,
            mileage: {
              lte: vehicle.mileage + 5000,
              gte: vehicle.mileage - 5000
            }
          }
        });

        return {
          vehicle,
          valuation: valuation?.estimatedValue || null
        };
      })
    );

    res.json({
      success: true,
      data: comparisons
    });
  })
);

// Get trending valuations
router.get(
  '/trending',
  asyncHandler(async (req: Request, res: Response) => {
    // Get the most recently updated valuations
    const trending = await prisma.vehicleValuation.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 20
    });

    res.json({
      success: true,
      data: trending
    });
  })
);

export { router as valuationRoutes };
