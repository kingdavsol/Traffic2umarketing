import { Request, Response } from 'express';
import { logger } from '../config/logger';
import { query } from '../database/connection';

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

    // TODO: Fetch listing by ID from database

    res.status(200).json({
      success: true,
      data: {},
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
    const { id } = req.params;
    const { title, description, price } = req.body;

    // TODO: Update listing in database

    res.status(200).json({
      success: true,
      message: 'Listing updated successfully',
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
    const { id } = req.params;

    // TODO: Delete listing from database

    res.status(200).json({
      success: true,
      message: 'Listing deleted successfully',
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
    const { marketplaces } = req.body;

    // TODO: Publish to selected marketplaces
    // TODO: Update listing status
    // TODO: Award bonus points

    res.status(200).json({
      success: true,
      message: 'Listing published successfully',
      statusCode: 200,
    });
  } catch (error) {
    logger.error('Publish listing error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to publish listing',
      statusCode: 500,
    });
  }
};
