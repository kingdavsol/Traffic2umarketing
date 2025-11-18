import { Router, Response, Request } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, AppError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// Get common problems for a vehicle
router.get(
  '/vehicle/:make/:model',
  asyncHandler(async (req: Request, res: Response) => {
    const { make, model } = req.params;
    const { year, mileage } = req.query;

    let where: any = {
      vehicleMake: make,
      vehicleModel: model
    };

    if (year) {
      where.vehicleYear = parseInt(year as string);
    }

    if (mileage) {
      const mileageNum = parseInt(mileage as string);
      where.OR = [
        { mileageMin: { lte: mileageNum } },
        { mileageMax: { gte: mileageNum } }
      ];
    }

    const problems = await prisma.commonProblem.findMany({
      where,
      include: {
        parts: {
          include: {
            priceListings: {
              orderBy: { totalPrice: 'asc' },
              take: 3
            }
          }
        }
      }
    });

    res.json({
      success: true,
      data: problems
    });
  })
);

// Get single problem
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const problem = await prisma.commonProblem.findUnique({
      where: { id: req.params.id },
      include: {
        parts: {
          include: {
            priceListings: {
              orderBy: { totalPrice: 'asc' }
            }
          }
        },
        maintenanceGuides: true
      }
    });

    if (!problem) {
      throw new AppError(404, 'Problem not found');
    }

    res.json({
      success: true,
      data: problem
    });
  })
);

// Get all problems (with pagination)
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt((req.query.page as string) || '1');
    const limit = parseInt((req.query.limit as string) || '20');
    const category = req.query.category as string | undefined;

    const where = category ? { category } : {};
    const skip = (page - 1) * limit;

    const [problems, total] = await Promise.all([
      prisma.commonProblem.findMany({
        where,
        skip,
        take: limit,
        include: { parts: { take: 3 } }
      }),
      prisma.commonProblem.count({ where })
    ]);

    res.json({
      success: true,
      data: problems,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  })
);

export { router as problemsRoutes };
