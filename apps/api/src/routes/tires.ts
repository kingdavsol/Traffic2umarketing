import { Router, Response, Request } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, AppError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// Get tire recommendations for a vehicle
router.get(
  '/vehicle/:make/:model/:year',
  asyncHandler(async (req: Request, res: Response) => {
    const { make, model, year } = req.params;
    const { season } = req.query;

    let where: any = {
      vehicleMake: make,
      vehicleModel: model,
      vehicleYear: parseInt(year)
    };

    if (season) {
      where.season = season;
    }

    const tires = await prisma.tire.findMany({
      where,
      orderBy: { price: 'asc' }
    });

    // Separate best value and cheapest
    const bestValue = tires.filter(t => t.bestValue);
    const cheapest = tires.filter(t => !t.bestValue);

    res.json({
      success: true,
      data: {
        bestValue: bestValue.slice(0, 5),
        cheapest: cheapest.slice(0, 5),
        allOptions: tires
      }
    });
  })
);

// Get all tires with filters
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { brand, season, vehicleYear, page = '1', limit = '20' } = req.query;

    let where: any = {};

    if (brand) where.brand = brand;
    if (season) where.season = season;
    if (vehicleYear) where.vehicleYear = parseInt(vehicleYear as string);

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [tires, total] = await Promise.all([
      prisma.tire.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        orderBy: [{ bestValue: 'desc' }, { price: 'asc' }]
      }),
      prisma.tire.count({ where })
    ]);

    res.json({
      success: true,
      data: tires,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  })
);

// Get tire by ID
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const tire = await prisma.tire.findUnique({
      where: { id: req.params.id }
    });

    if (!tire) {
      throw new AppError(404, 'Tire not found');
    }

    res.json({
      success: true,
      data: tire
    });
  })
);

export { router as tiresRoutes };
