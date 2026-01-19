import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { logger } from '../config/logger';
import { query } from '../database/connection';

const router = Router();

/**
 * Shipping options for listings
 * QuickSell does not calculate shipping costs - that is handled by the user or marketplace directly.
 * This service only tracks whether an item is available for shipping, local pickup, or both.
 */

// Available fulfillment types
const FULFILLMENT_TYPES = [
  { id: 'shipping', name: 'Shipping', description: 'Item can be shipped to buyer' },
  { id: 'local_pickup', name: 'Local Pickup', description: 'Buyer can pick up locally' },
  { id: 'both', name: 'Shipping & Local Pickup', description: 'Both shipping and local pickup available' },
];

/**
 * @route   GET /api/v1/shipping/options
 * @desc    Get available fulfillment/shipping options
 * @access  Public
 */
router.get('/options', async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        fulfillmentTypes: FULFILLMENT_TYPES,
        note: 'Shipping costs and logistics are handled directly by the seller or through the marketplace. QuickSell only tracks fulfillment availability.',
      },
      statusCode: 200,
    });
  } catch (error) {
    logger.error('Get shipping options error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch shipping options',
      statusCode: 500,
    });
  }
});

/**
 * @route   GET /api/v1/shipping/listing/:listingId
 * @desc    Get fulfillment info for a specific listing
 * @access  Public
 */
router.get('/listing/:listingId', async (req: Request, res: Response) => {
  try {
    const { listingId } = req.params;

    const result = await query(
      `SELECT id, title, fulfillment_type, location
       FROM listings
       WHERE id = $1 AND deleted_at IS NULL`,
      [listingId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Listing not found',
        statusCode: 404,
      });
    }

    const listing = result.rows[0];
    const fulfillmentType = FULFILLMENT_TYPES.find(f => f.id === listing.fulfillment_type) || FULFILLMENT_TYPES[0];

    res.status(200).json({
      success: true,
      data: {
        listingId: listing.id,
        title: listing.title,
        fulfillmentType: fulfillmentType,
        location: listing.location,
        shippingAvailable: listing.fulfillment_type === 'shipping' || listing.fulfillment_type === 'both',
        localPickupAvailable: listing.fulfillment_type === 'local_pickup' || listing.fulfillment_type === 'both',
      },
      statusCode: 200,
    });
  } catch (error) {
    logger.error('Get listing shipping info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch shipping info',
      statusCode: 500,
    });
  }
});

/**
 * @route   PUT /api/v1/shipping/listing/:listingId
 * @desc    Update fulfillment type for a listing
 * @access  Private
 */
router.put('/listing/:listingId', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { listingId } = req.params;
    const { fulfillmentType, location } = req.body;

    // Validate fulfillment type
    const validType = FULFILLMENT_TYPES.find(f => f.id === fulfillmentType);
    if (!validType) {
      return res.status(400).json({
        success: false,
        error: 'Invalid fulfillment type. Must be: shipping, local_pickup, or both',
        statusCode: 400,
      });
    }

    // Verify listing belongs to user
    const listingResult = await query(
      'SELECT id FROM listings WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
      [listingId, userId]
    );

    if (listingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Listing not found',
        statusCode: 404,
      });
    }

    // Update the listing
    const updateFields = ['fulfillment_type = $1', 'updated_at = CURRENT_TIMESTAMP'];
    const updateParams: any[] = [fulfillmentType];

    if (location !== undefined) {
      updateFields.push(`location = $${updateParams.length + 1}`);
      updateParams.push(location);
    }

    updateParams.push(listingId);

    await query(
      `UPDATE listings SET ${updateFields.join(', ')} WHERE id = $${updateParams.length}`,
      updateParams
    );

    res.status(200).json({
      success: true,
      message: 'Fulfillment options updated',
      data: {
        listingId: parseInt(listingId),
        fulfillmentType: validType,
        location: location,
      },
      statusCode: 200,
    });
  } catch (error) {
    logger.error('Update shipping info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update shipping info',
      statusCode: 500,
    });
  }
});

export default router;
