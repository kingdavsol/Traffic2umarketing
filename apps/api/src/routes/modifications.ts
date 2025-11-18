import { Router, Response, Request } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, AppError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// Get modifications for a vehicle
router.get(
  '/vehicle/:make/:model',
  asyncHandler(async (req: Request, res: Response) => {
    const { make, model } = req.params;
    const { year, category } = req.query;

    let where: any = {
      vehicleMake: make,
      vehicleModel: model
    };

    if (year) {
      where.vehicleYear = parseInt(year as string);
    }

    if (category) {
      where.category = category;
    }

    const modifications = await prisma.modification.findMany({
      where,
      orderBy: { popularity: 'desc' }
    });

    res.json({
      success: true,
      data: modifications
    });
  })
);

// Get all modifications with filters
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { category, make, model, page = '1', limit = '20' } = req.query;

    let where: any = {};

    if (category) where.category = category;
    if (make) where.vehicleMake = make;
    if (model) where.vehicleModel = model;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [modifications, total] = await Promise.all([
      prisma.modification.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        orderBy: { popularity: 'desc' }
      }),
      prisma.modification.count({ where })
    ]);

    res.json({
      success: true,
      data: modifications,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  })
);

// Get modification by ID
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const modification = await prisma.modification.findUnique({
      where: { id: req.params.id }
    });

    if (!modification) {
      throw new AppError(404, 'Modification not found');
    }

    res.json({
      success: true,
      data: modification
    });
  })
);

// Get popular modifications
router.get(
  '/popular/:category',
  asyncHandler(async (req: Request, res: Response) => {
    const { category } = req.params;

    const modifications = await prisma.modification.findMany({
      where: { category },
      orderBy: { popularity: 'desc' },
      take: 10
    });

    res.json({
      success: true,
      data: modifications
    });
  })
);

export { router as modificationsRoutes };
