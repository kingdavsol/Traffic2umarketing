import { Router, Response, Request } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, AppError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// Get parts for a problem
router.get(
  '/problem/:problemId',
  asyncHandler(async (req: Request, res: Response) => {
    const parts = await prisma.part.findMany({
      where: { problemId: req.params.problemId },
      include: {
        priceListings: {
          orderBy: { totalPrice: 'asc' }
        }
      }
    });

    res.json({
      success: true,
      data: parts
    });
  })
);

// Get single part with all price listings
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const part = await prisma.part.findUnique({
      where: { id: req.params.id },
      include: {
        priceListings: {
          orderBy: { totalPrice: 'asc' }
        },
        problem: true
      }
    });

    if (!part) {
      throw new AppError(404, 'Part not found');
    }

    res.json({
      success: true,
      data: part
    });
  })
);

// Get best price for a part
router.get(
  '/:id/best-price',
  asyncHandler(async (req: Request, res: Response) => {
    const part = await prisma.part.findUnique({
      where: { id: req.params.id },
      include: {
        priceListings: {
          where: { inStock: true },
          orderBy: { totalPrice: 'asc' },
          take: 1
        }
      }
    });

    if (!part) {
      throw new AppError(404, 'Part not found');
    }

    res.json({
      success: true,
      data: {
        part,
        bestPrice: part.priceListings[0] || null
      }
    });
  })
);

// Get price comparison for a part across retailers
router.get(
  '/:id/compare',
  asyncHandler(async (req: Request, res: Response) => {
    const listings = await prisma.priceListing.findMany({
      where: {
        partId: req.params.id,
        inStock: true
      },
      orderBy: { totalPrice: 'asc' }
    });

    if (listings.length === 0) {
      throw new AppError(404, 'No price listings found for this part');
    }

    // Group by retailer and get best price from each
    const byRetailer = listings.reduce((acc: any, listing) => {
      if (!acc[listing.retailer]) {
        acc[listing.retailer] = listing;
      }
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        bestOverallPrice: listings[0],
        byRetailer,
        allListings: listings
      }
    });
  })
);

export { router as partsRoutes };
