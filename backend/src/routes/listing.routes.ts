import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { logger } from '../config/logger';
import { query } from '../database/connection';
import {
  getListings,
  createListing,
  getListing,
  updateListing,
  deleteListing,
  getAssistedPostingUrls,
  publishListing
} from '../controllers/listingController';

const router = Router();

/**
 * @route   GET /api/v1/listings
 * @desc    Get all listings for authenticated user
 * @access  Private
 */
router.get('/', authenticate, getListings);

/**
 * @route   POST /api/v1/listings
 * @desc    Create a new listing
 * @access  Private
 */
router.post('/', authenticate, createListing);

/**
 * @route   GET /api/v1/listings/:id
 * @desc    Get a specific listing
 * @access  Private
 */
router.get('/:id', authenticate, getListing);

/**
 * @route   PUT /api/v1/listings/:id
 * @desc    Update a listing
 * @access  Private
 */
router.put('/:id', authenticate, updateListing);

/**
 * @route   DELETE /api/v1/listings/:id
 * @desc    Delete a listing
 * @access  Private
 */
router.delete('/:id', authenticate, deleteListing);

/**
 * @route   POST /api/v1/listings/:id/publish
 * @desc    Publish listing to marketplaces with automation and watermarking
 * @access  Private
 */
router.post('/:id/publish', authenticate, publishListing);

/**
 * @route   POST /api/v1/listings/:id/assisted-posting
 * @desc    Get pre-filled marketplace URLs for assisted posting
 * @access  Private
 */
router.post('/:id/assisted-posting', authenticate, getAssistedPostingUrls);

/**
 * @route   POST /api/v1/listings/batch
 * @desc    Bulk operations on listings (delete, publish, unpublish, archive)
 * @access  Private
 */
router.post('/batch', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { operation, listingIds } = req.body;

    // Validate input
    if (!operation || !listingIds || !Array.isArray(listingIds) || listingIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Operation and listingIds array are required',
        statusCode: 400
      });
    }

    const validOperations = ['delete', 'publish', 'unpublish', 'archive', 'restore'];
    if (!validOperations.includes(operation)) {
      return res.status(400).json({
        success: false,
        error: `Invalid operation. Valid operations: ${validOperations.join(', ')}`,
        statusCode: 400
      });
    }

    // Verify all listings belong to user
    const verifyResult = await query(
      `SELECT id FROM listings WHERE id = ANY($1) AND user_id = $2`,
      [listingIds, userId]
    );

    const validIds = verifyResult.rows.map((r: any) => r.id);
    const invalidIds = listingIds.filter(id => !validIds.includes(id));

    if (invalidIds.length > 0) {
      return res.status(403).json({
        success: false,
        error: `You do not have permission to modify listings: ${invalidIds.join(', ')}`,
        statusCode: 403
      });
    }

    let affectedCount = 0;
    let result;

    switch (operation) {
      case 'delete':
        // Soft delete listings
        result = await query(
          `UPDATE listings SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
           WHERE id = ANY($1) AND user_id = $2 AND deleted_at IS NULL`,
          [listingIds, userId]
        );
        affectedCount = result.rowCount || 0;
        break;

      case 'publish':
        // Set status to published
        result = await query(
          `UPDATE listings SET status = 'published', updated_at = CURRENT_TIMESTAMP
           WHERE id = ANY($1) AND user_id = $2 AND deleted_at IS NULL`,
          [listingIds, userId]
        );
        affectedCount = result.rowCount || 0;
        break;

      case 'unpublish':
        // Set status to draft
        result = await query(
          `UPDATE listings SET status = 'draft', updated_at = CURRENT_TIMESTAMP
           WHERE id = ANY($1) AND user_id = $2 AND deleted_at IS NULL`,
          [listingIds, userId]
        );
        affectedCount = result.rowCount || 0;
        break;

      case 'archive':
        // Set status to archived
        result = await query(
          `UPDATE listings SET status = 'archived', updated_at = CURRENT_TIMESTAMP
           WHERE id = ANY($1) AND user_id = $2 AND deleted_at IS NULL`,
          [listingIds, userId]
        );
        affectedCount = result.rowCount || 0;
        break;

      case 'restore':
        // Restore soft-deleted listings
        result = await query(
          `UPDATE listings SET deleted_at = NULL, status = 'draft', updated_at = CURRENT_TIMESTAMP
           WHERE id = ANY($1) AND user_id = $2`,
          [listingIds, userId]
        );
        affectedCount = result.rowCount || 0;
        break;
    }

    logger.info(`User ${userId} performed bulk ${operation} on ${affectedCount} listings`);

    res.status(200).json({
      success: true,
      message: `Successfully ${operation}ed ${affectedCount} listing(s)`,
      data: {
        operation,
        requestedCount: listingIds.length,
        affectedCount,
      },
      statusCode: 200
    });
  } catch (error: any) {
    logger.error('Batch operation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Batch operation failed',
      statusCode: 500
    });
  }
});

export default router;
