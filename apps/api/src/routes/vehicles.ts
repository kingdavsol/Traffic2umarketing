import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// Get all vehicles for user
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const vehicles = await prisma.vehicle.findMany({
      where: { userId: req.userId }
    });

    res.json({
      success: true,
      data: vehicles
    });
  })
);

// Get single vehicle
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: req.params.id }
    });

    if (!vehicle || vehicle.userId !== req.userId) {
      throw new AppError(404, 'Vehicle not found');
    }

    res.json({
      success: true,
      data: vehicle
    });
  })
);

// Create vehicle
router.post(
  '/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { make, model, trim, year, mileage, vin, transmission, fuelType, engine, driveType } = req.body;

    if (!make || !model || !year || mileage === undefined) {
      throw new AppError(400, 'Make, model, year, and mileage are required');
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        userId: req.userId!,
        make,
        model,
        trim,
        year,
        mileage,
        vin,
        transmission,
        fuelType,
        engine,
        driveType
      }
    });

    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: vehicle
    });
  })
);

// Update vehicle
router.put(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: req.params.id }
    });

    if (!vehicle || vehicle.userId !== req.userId) {
      throw new AppError(404, 'Vehicle not found');
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.json({
      success: true,
      message: 'Vehicle updated successfully',
      data: updatedVehicle
    });
  })
);

// Delete vehicle
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: req.params.id }
    });

    if (!vehicle || vehicle.userId !== req.userId) {
      throw new AppError(404, 'Vehicle not found');
    }

    await prisma.vehicle.delete({
      where: { id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  })
);

export { router as vehicleRoutes };
