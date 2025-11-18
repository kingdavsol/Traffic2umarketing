import { Router, Response, Request } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { MAINTENANCE_SCHEDULE } from '@car-hub/shared';

const router = Router();
const prisma = new PrismaClient();

// Get maintenance schedule
router.get(
  '/schedule/:make/:model/:year',
  asyncHandler(async (req: Request, res: Response) => {
    // This is a static schedule that can be customized per vehicle
    const schedule = Object.entries(MAINTENANCE_SCHEDULE).map(([key, value]) => ({
      id: key,
      ...value
    }));

    res.json({
      success: true,
      data: schedule
    });
  })
);

// Get maintenance deals - oil, filters, tires, brakes, etc.
router.get(
  '/deals/items',
  asyncHandler(async (req: Request, res: Response) => {
    const { category, page = '1', limit = '20' } = req.query;

    const categories = ['oil', 'filters', 'tires', 'brakes', 'wipers', 'fluids', 'batteries', 'air-conditioning'];

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Find parts and price listings for maintenance items
    let where: any = {
      problem: {
        category: {
          in: categories
        }
      }
    };

    if (category && categories.includes(category as string)) {
      where.problem.category = category;
    }

    const [parts, total] = await Promise.all([
      prisma.part.findMany({
        where,
        include: {
          priceListings: {
            where: { inStock: true },
            orderBy: { totalPrice: 'asc' },
            take: 5
          },
          problem: true
        },
        skip,
        take: parseInt(limit as string)
      }),
      prisma.part.count({ where })
    ]);

    res.json({
      success: true,
      data: parts,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  })
);

// Get maintenance items deals from specific retailer
router.get(
  '/deals/retailer/:retailer',
  asyncHandler(async (req: Request, res: Response) => {
    const { retailer } = req.params;
    const { page = '1', limit = '20' } = req.query;

    const validRetailers = ['amazon', 'ebay', 'rockauto', 'partsgeek'];
    if (!validRetailers.includes(retailer)) {
      throw new AppError(400, 'Invalid retailer');
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [listings, total] = await Promise.all([
      prisma.priceListing.findMany({
        where: {
          retailer,
          inStock: true
        },
        include: {
          part: {
            include: {
              problem: true
            }
          }
        },
        orderBy: { totalPrice: 'asc' },
        skip,
        take: parseInt(limit as string)
      }),
      prisma.priceListing.count({
        where: { retailer, inStock: true }
      })
    ]);

    res.json({
      success: true,
      data: listings,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  })
);

// Record maintenance for a vehicle
router.post(
  '/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { vehicleId, date, mileage, category, title, description, cost, partsUsed, notes } = req.body;

    if (!vehicleId || !category || !title) {
      throw new AppError(400, 'Vehicle ID, category, and title are required');
    }

    // Verify vehicle belongs to user
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId }
    });

    if (!vehicle || vehicle.userId !== req.userId) {
      throw new AppError(403, 'Unauthorized: Vehicle not found');
    }

    const record = await prisma.maintenanceRecord.create({
      data: {
        vehicleId,
        userId: req.userId!,
        date: new Date(date || Date.now()),
        mileage: mileage || vehicle.mileage,
        category,
        title,
        description,
        cost: cost || 0,
        partsUsed,
        notes
      }
    });

    // Update vehicle mileage if new record mileage is higher
    if (mileage && mileage > vehicle.mileage) {
      await prisma.vehicle.update({
        where: { id: vehicleId },
        data: { mileage }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Maintenance record created',
      data: record
    });
  })
);

// Get maintenance history for a vehicle
router.get(
  '/vehicle/:vehicleId',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { vehicleId } = req.params;
    const { page = '1', limit = '20', category } = req.query;

    // Verify vehicle belongs to user
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId }
    });

    if (!vehicle || vehicle.userId !== req.userId) {
      throw new AppError(403, 'Unauthorized: Vehicle not found');
    }

    let where: any = { vehicleId };
    if (category) {
      where.category = category;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [records, total] = await Promise.all([
      prisma.maintenanceRecord.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: parseInt(limit as string)
      }),
      prisma.maintenanceRecord.count({ where })
    ]);

    res.json({
      success: true,
      data: records,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  })
);

// Get maintenance record by ID
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const record = await prisma.maintenanceRecord.findUnique({
      where: { id: req.params.id }
    });

    if (!record || record.userId !== req.userId) {
      throw new AppError(403, 'Unauthorized: Record not found');
    }

    res.json({
      success: true,
      data: record
    });
  })
);

// Update maintenance record
router.put(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const record = await prisma.maintenanceRecord.findUnique({
      where: { id: req.params.id }
    });

    if (!record || record.userId !== req.userId) {
      throw new AppError(403, 'Unauthorized: Record not found');
    }

    const updated = await prisma.maintenanceRecord.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.json({
      success: true,
      message: 'Maintenance record updated',
      data: updated
    });
  })
);

// Delete maintenance record
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const record = await prisma.maintenanceRecord.findUnique({
      where: { id: req.params.id }
    });

    if (!record || record.userId !== req.userId) {
      throw new AppError(403, 'Unauthorized: Record not found');
    }

    await prisma.maintenanceRecord.delete({
      where: { id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Maintenance record deleted'
    });
  })
);

export { router as maintenanceRoutes };
