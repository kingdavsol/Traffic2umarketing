import { Request, Response } from 'express';
import { logger } from '../config/logger';
import { query } from '../database/connection';
import marketplaceAutomationService from '../services/marketplaceAutomationService';
import { onListingCreated } from './gamificationController';

export const getListings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let queryText = 'SELECT * FROM listings WHERE user_id = $1 AND deleted_at IS NULL';
    const params: any[] = [userId];

    if (status) {
      queryText += ' AND status = $2';
      params.push(status);
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), offset);

    const result = await query(queryText, params);

    const countResult = await query(
      'SELECT COUNT(*) FROM listings WHERE user_id = $1 AND deleted_at IS NULL',
      [userId]
    );

    res.status(200).json({
      success: true,
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: Number(page),
      limit: Number(limit),
      statusCode: 200,
    });
  } catch (error) {
    logger.error('Get listings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch listings',
      statusCode: 500,
    });
  }
};

export const createListing = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const {
      title,
      description,
      category,
      price,
      condition,
      brand,
      model,
      color,
      size,
      fulfillment_type,
      photos,
      status,
      ai_generated
    } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        error: 'Title and description are required',
        statusCode: 400,
      });
    }

    const queryText = `
      INSERT INTO listings (
        user_id, title, description, category, price, condition,
        brand, model, color, size, fulfillment_type, photos, status, ai_generated
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;

    const params = [
      userId,
      title,
      description,
      category || null,
      price || 0,
      condition || null,
      brand || null,
      model || null,
      color || null,
      size || null,
      fulfillment_type || 'both',
      JSON.stringify(photos || []),
      status || 'draft',
      ai_generated || false
    ];

    const result = await query(queryText, params);

    logger.info(`Listing created: ${result.rows[0].id} by user ${userId}`);

    // Award gamification points
    await onListingCreated(userId);

    res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      data: result.rows[0],
      statusCode: 201,
    });
  } catch (error) {
    logger.error('Create listing error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create listing',
      statusCode: 500,
    });
  }
};

export const getListing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const result = await query(
      'SELECT * FROM listings WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Listing not found',
        statusCode: 404,
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
      statusCode: 200,
    });
  } catch (error) {
    logger.error('Get listing error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch listing',
      statusCode: 500,
    });
  }
};

export const updateListing = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const {
      title,
      description,
      category,
      price,
      condition,
      brand,
      model,
      color,
      size,
      fulfillment_type,
      photos,
      status
    } = req.body;

    // Build dynamic UPDATE query based on provided fields
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      params.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      params.push(description);
    }
    if (category !== undefined) {
      updates.push(`category = $${paramIndex++}`);
      params.push(category);
    }
    if (price !== undefined) {
      updates.push(`price = $${paramIndex++}`);
      params.push(price);
    }
    if (condition !== undefined) {
      updates.push(`condition = $${paramIndex++}`);
      params.push(condition);
    }
    if (brand !== undefined) {
      updates.push(`brand = $${paramIndex++}`);
      params.push(brand);
    }
    if (model !== undefined) {
      updates.push(`model = $${paramIndex++}`);
      params.push(model);
    }
    if (color !== undefined) {
      updates.push(`color = $${paramIndex++}`);
      params.push(color);
    }
    if (size !== undefined) {
      updates.push(`size = $${paramIndex++}`);
      params.push(size);
    }
    if (fulfillment_type !== undefined) {
      updates.push(`fulfillment_type = $${paramIndex++}`);
      params.push(fulfillment_type);
    }
    if (photos !== undefined) {
      updates.push(`photos = $${paramIndex++}`);
      params.push(JSON.stringify(photos));
    }
    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      params.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update',
        statusCode: 400,
      });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id, userId);

    const queryText = `
      UPDATE listings
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex++} AND user_id = $${paramIndex++} AND deleted_at IS NULL
      RETURNING *
    `;

    const result = await query(queryText, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Listing not found',
        statusCode: 404,
      });
    }

    logger.info(`Listing updated: ${id} by user ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Listing updated successfully',
      data: result.rows[0],
      statusCode: 200,
    });
  } catch (error) {
    logger.error('Update listing error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update listing',
      statusCode: 500,
    });
  }
};

export const deleteListing = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    // Soft delete - set deleted_at timestamp
    const queryText = `
      UPDATE listings
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
      RETURNING id
    `;

    const result = await query(queryText, [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Listing not found',
        statusCode: 404,
      });
    }

    logger.info(`Listing deleted: ${id} by user ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Listing deleted successfully',
      data: { id: result.rows[0].id },
      statusCode: 200,
    });
  } catch (error) {
    logger.error('Delete listing error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete listing',
      statusCode: 500,
    });
  }
};

export const publishListing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const { marketplaces, city, zipcode, skipWatermark } = req.body;

    if (!marketplaces || !Array.isArray(marketplaces) || marketplaces.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please select at least one marketplace',
        statusCode: 400,
      });
    }

    logger.info(`Publishing listing ${id} to marketplaces: ${marketplaces.join(', ')}`);

    // Publish to selected marketplaces with watermarking
    const { results, overallSuccess } = await marketplaceAutomationService.publishToMarketplaces(
      parseInt(id),
      userId,
      marketplaces,
      { city, zipcode, skipWatermark }
    );

    // Separate automatic vs manual posting results
    const automaticPosts = results.filter(r => r.success);
    const failedPosts = results.filter(r => !r.success && !r.error?.includes('copy buttons'));
    const manualPosts = results.filter(r => !r.success && r.error?.includes('copy buttons'));

    const responseMessage = overallSuccess
      ? `Successfully published to ${automaticPosts.length} marketplace(s)`
      : `Failed to publish to all marketplaces`;

    res.status(200).json({
      success: overallSuccess,
      message: responseMessage,
      data: {
        results,
        automaticPosts,
        failedPosts,
        manualPosts,
        summary: {
          total: marketplaces.length,
          automaticSuccess: automaticPosts.length,
          failed: failedPosts.length,
          requiresManual: manualPosts.length
        }
      },
      statusCode: 200,
    });
  } catch (error: any) {
    logger.error('Publish listing error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to publish listing',
      statusCode: 500,
    });
  }
};

export const getAssistedPostingUrls = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const { marketplaces } = req.body;

    if (!marketplaces || !Array.isArray(marketplaces) || marketplaces.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please select at least one marketplace',
        statusCode: 400,
      });
    }

    // Get listing from database
    const result = await query(
      'SELECT * FROM listings WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Listing not found',
        statusCode: 404,
      });
    }

    const listing = result.rows[0];

    // Import assisted posting service
    const { generateAssistedPostingUrls, getCopyPasteTemplate } = require('../services/assistedPostingService');

    // Generate URLs for selected marketplaces
    const urls = await generateAssistedPostingUrls(listing, marketplaces);

    // Generate copy-paste template
    const copyPasteTemplate = getCopyPasteTemplate(listing, marketplaces[0]);

    logger.info(`Generated assisted posting URLs for listing ${id}, marketplaces: ${marketplaces.join(', ')}`);

    res.status(200).json({
      success: true,
      message: `Generated ${urls.length} assisted posting URL(s)`,
      data: {
        urls,
        copyPasteTemplate,
        listingId: id,
        listingTitle: listing.title
      },
      statusCode: 200,
    });
  } catch (error: any) {
    logger.error('Get assisted posting URLs error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate assisted posting URLs',
      statusCode: 500,
    });
  }
};
