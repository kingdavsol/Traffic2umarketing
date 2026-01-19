import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { logger } from '../config/logger';
import { query } from '../database/connection';

const router = Router();

// Shipping carrier configurations with base rates
const CARRIERS = {
  usps: {
    id: 'usps',
    name: 'USPS',
    services: [
      { id: 'usps_priority', name: 'Priority Mail', baseRate: 7.95, perPound: 0.85, days: '1-3' },
      { id: 'usps_first_class', name: 'First Class', baseRate: 4.50, perPound: 0.50, days: '3-5', maxWeight: 13 },
      { id: 'usps_ground', name: 'Ground Advantage', baseRate: 5.25, perPound: 0.65, days: '2-5' },
      { id: 'usps_media', name: 'Media Mail', baseRate: 3.65, perPound: 0.75, days: '5-8' },
    ],
  },
  ups: {
    id: 'ups',
    name: 'UPS',
    services: [
      { id: 'ups_ground', name: 'UPS Ground', baseRate: 9.50, perPound: 0.95, days: '3-5' },
      { id: 'ups_3day', name: 'UPS 3 Day Select', baseRate: 15.95, perPound: 1.25, days: '3' },
      { id: 'ups_2day', name: 'UPS 2nd Day Air', baseRate: 22.50, perPound: 1.75, days: '2' },
      { id: 'ups_next_day', name: 'UPS Next Day Air', baseRate: 45.00, perPound: 2.50, days: '1' },
    ],
  },
  fedex: {
    id: 'fedex',
    name: 'FedEx',
    services: [
      { id: 'fedex_ground', name: 'FedEx Ground', baseRate: 9.95, perPound: 0.90, days: '3-5' },
      { id: 'fedex_express', name: 'FedEx Express Saver', baseRate: 18.50, perPound: 1.45, days: '3' },
      { id: 'fedex_2day', name: 'FedEx 2Day', baseRate: 24.95, perPound: 1.85, days: '2' },
      { id: 'fedex_overnight', name: 'FedEx Priority Overnight', baseRate: 49.95, perPound: 2.75, days: '1' },
    ],
  },
};

// Zone-based rate multipliers (simplified - real shipping uses ZIP codes)
const ZONE_MULTIPLIERS: Record<string, number> = {
  local: 1.0,      // Same state
  regional: 1.15,  // Neighboring states
  national: 1.35,  // Cross-country
};

/**
 * Calculate dimensional weight (for oversized packages)
 */
function calculateDimensionalWeight(length: number, width: number, height: number): number {
  // Industry standard: 139 cubic inches per pound
  return Math.ceil((length * width * height) / 139);
}

/**
 * Determine shipping zone based on origin/destination
 */
function determineZone(origin: string, destination: string): string {
  if (!origin || !destination) return 'national';

  const originState = origin.slice(-2).toUpperCase();
  const destState = destination.slice(-2).toUpperCase();

  if (originState === destState) return 'local';

  // Simplified regional check (neighboring states would need full mapping)
  const regions: Record<string, string[]> = {
    northeast: ['NY', 'NJ', 'PA', 'CT', 'MA', 'VT', 'NH', 'ME', 'RI'],
    southeast: ['FL', 'GA', 'SC', 'NC', 'VA', 'TN', 'AL', 'MS'],
    midwest: ['IL', 'IN', 'OH', 'MI', 'WI', 'MN', 'IA', 'MO'],
    southwest: ['TX', 'OK', 'AR', 'LA', 'NM', 'AZ'],
    west: ['CA', 'NV', 'OR', 'WA', 'CO', 'UT', 'ID', 'MT', 'WY'],
  };

  for (const [region, states] of Object.entries(regions)) {
    if (states.includes(originState) && states.includes(destState)) {
      return 'regional';
    }
  }

  return 'national';
}

/**
 * @route   POST /api/v1/shipping/calculate
 * @desc    Calculate shipping costs for all carriers
 * @access  Private
 */
router.post('/calculate', authenticate, async (req: Request, res: Response) => {
  try {
    const { weight, dimensions, origin, destination } = req.body;

    if (!weight) {
      return res.status(400).json({
        success: false,
        error: 'Weight is required',
        statusCode: 400,
      });
    }

    const actualWeight = parseFloat(weight) || 1;

    // Parse dimensions (format: "LxWxH" or object)
    let dimWeight = 0;
    if (dimensions) {
      let length = 0, width = 0, height = 0;

      if (typeof dimensions === 'string') {
        const parts = dimensions.toLowerCase().split('x').map(p => parseFloat(p.trim()));
        [length, width, height] = parts;
      } else if (typeof dimensions === 'object') {
        length = dimensions.length || 0;
        width = dimensions.width || 0;
        height = dimensions.height || 0;
      }

      if (length && width && height) {
        dimWeight = calculateDimensionalWeight(length, width, height);
      }
    }

    // Use the greater of actual weight or dimensional weight
    const billableWeight = Math.max(actualWeight, dimWeight);

    // Determine shipping zone
    const zone = determineZone(origin, destination);
    const zoneMultiplier = ZONE_MULTIPLIERS[zone];

    // Calculate rates for all carriers and services
    const rates: any[] = [];

    for (const [carrierId, carrier] of Object.entries(CARRIERS)) {
      for (const service of carrier.services) {
        // Skip if weight exceeds max (e.g., First Class has weight limit)
        if (service.maxWeight && billableWeight > service.maxWeight) continue;

        const baseCost = service.baseRate + (billableWeight * service.perPound);
        const totalCost = Math.round(baseCost * zoneMultiplier * 100) / 100;

        rates.push({
          carrier: carrier.name,
          carrierId: carrier.id,
          serviceId: service.id,
          serviceName: service.name,
          cost: totalCost,
          estimatedDays: service.days,
          billableWeight,
          zone,
        });
      }
    }

    // Sort by cost
    rates.sort((a, b) => a.cost - b.cost);

    res.status(200).json({
      success: true,
      data: {
        rates,
        cheapestOption: rates[0],
        fastestOption: rates.reduce((fast, r) => {
          const fastDays = parseInt(fast.estimatedDays);
          const rDays = parseInt(r.estimatedDays);
          return rDays < fastDays ? r : fast;
        }),
        weight: actualWeight,
        dimensionalWeight: dimWeight,
        billableWeight,
        zone,
      },
      statusCode: 200,
    });
  } catch (error) {
    logger.error('Shipping calculation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate shipping',
      statusCode: 500,
    });
  }
});

/**
 * @route   GET /api/v1/shipping/carriers
 * @desc    Get available shipping carriers and services
 * @access  Public
 */
router.get('/carriers', async (req: Request, res: Response) => {
  try {
    const carriers = Object.values(CARRIERS).map(carrier => ({
      id: carrier.id,
      name: carrier.name,
      services: carrier.services.map(s => ({
        id: s.id,
        name: s.name,
        estimatedDays: s.days,
        maxWeight: s.maxWeight,
      })),
    }));

    res.status(200).json({
      success: true,
      data: carriers,
      statusCode: 200,
    });
  } catch (error) {
    logger.error('Get carriers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch carriers',
      statusCode: 500,
    });
  }
});

/**
 * @route   POST /api/v1/shipping/create-label
 * @desc    Create shipping label (placeholder - would integrate with carrier APIs)
 * @access  Private
 */
router.post('/create-label', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { saleId, carrier, serviceId, fromAddress, toAddress } = req.body;

    if (!saleId || !carrier || !serviceId) {
      return res.status(400).json({
        success: false,
        error: 'Sale ID, carrier, and service are required',
        statusCode: 400,
      });
    }

    // Verify sale belongs to user
    const saleResult = await query(
      'SELECT id, listing_id FROM sales WHERE id = $1 AND user_id = $2',
      [saleId, userId]
    );

    if (saleResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Sale not found',
        statusCode: 404,
      });
    }

    // In production, this would call the carrier's API to create a label
    // For now, generate a mock tracking number
    const trackingNumber = `${carrier.toUpperCase()}${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Store tracking info in database
    await query(
      `UPDATE sales SET
        tracking_number = $1,
        carrier = $2,
        shipping_status = 'label_created',
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [trackingNumber, carrier, saleId]
    );

    res.status(201).json({
      success: true,
      data: {
        trackingNumber,
        carrier,
        service: serviceId,
        labelUrl: null, // Would be actual label URL from carrier API
        message: 'Shipping label created. In production, this would generate a printable label.',
      },
      statusCode: 201,
    });
  } catch (error) {
    logger.error('Create label error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create label',
      statusCode: 500,
    });
  }
});

/**
 * @route   GET /api/v1/shipping/track/:trackingNumber
 * @desc    Track a shipment
 * @access  Public
 */
router.get('/track/:trackingNumber', async (req: Request, res: Response) => {
  try {
    const { trackingNumber } = req.params;

    // In production, this would call the carrier's tracking API
    // For now, return mock tracking data
    res.status(200).json({
      success: true,
      data: {
        trackingNumber,
        status: 'in_transit',
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        events: [
          {
            date: new Date().toISOString(),
            location: 'Distribution Center',
            status: 'Package in transit',
          },
          {
            date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            location: 'Origin Facility',
            status: 'Package received',
          },
        ],
      },
      statusCode: 200,
    });
  } catch (error) {
    logger.error('Track shipment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track shipment',
      statusCode: 500,
    });
  }
});

export default router;
