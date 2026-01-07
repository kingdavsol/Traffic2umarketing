/**
 * Sales Controller
 * Handles sale transactions and integrates with listing management
 */

import { Request, Response } from 'express';
import { logger } from '../config/logger';
import { query } from '../database/connection';
import { onSaleCompleted } from './gamificationController';

/**
 * Mark a listing as sold
 * POST /api/v1/sales/mark-sold
 */
export const markListingAsSold = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const {
      listing_id,
      marketplace,
      sale_price,
      sale_date,
      buyer_name,
      buyer_email,
      transaction_id,
      notes
    } = req.body;

    if (!listing_id || !marketplace || !sale_price) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: listing_id, marketplace, sale_price',
        statusCode: 400,
      });
    }

    // Get listing details
    const listingResult = await query(
      'SELECT * FROM listings WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
      [listing_id, userId]
    );

    if (listingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Listing not found',
        statusCode: 404,
      });
    }

    const listing = listingResult.rows[0];

    // Create sale record
    const saleResult = await query(
      `INSERT INTO sales (
        user_id,
        listing_id,
        listing_title,
        marketplace,
        sale_price,
        sale_date,
        buyer_name,
        buyer_email,
        transaction_id,
        status,
        notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'completed', $10)
      RETURNING *`,
      [
        userId,
        listing_id,
        listing.title,
        marketplace,
        parseFloat(sale_price),
        sale_date || new Date().toISOString().split('T')[0],
        buyer_name || null,
        buyer_email || null,
        transaction_id || null,
        notes || null
      ]
    );

    // Update listing status to sold
    await query(
      `UPDATE listings
       SET status = 'sold', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2`,
      [listing_id, userId]
    );

    // Award gamification points for sale
    await onSaleCompleted(userId, parseFloat(sale_price));

    logger.info(`Listing ${listing_id} marked as sold by user ${userId}`);

    res.status(201).json({
      success: true,
      data: {
        sale: saleResult.rows[0],
        listing: {
          id: listing_id,
          status: 'sold'
        }
      },
      message: 'Listing marked as sold successfully',
      statusCode: 201,
    });
  } catch (error: any) {
    logger.error('Mark listing as sold error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to mark listing as sold',
      statusCode: 500,
    });
  }
};

/**
 * Get sales dashboard summary
 * GET /api/v1/sales/dashboard
 */
export const getSalesDashboard = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Get today's sales
    const todayResult = await query(
      `SELECT
        COUNT(*) as count,
        COALESCE(SUM(sale_price), 0) as revenue
       FROM sales
       WHERE user_id = $1
         AND sale_date = CURRENT_DATE
         AND status = 'completed'`,
      [userId]
    );

    // Get this week's sales
    const weekResult = await query(
      `SELECT
        COUNT(*) as count,
        COALESCE(SUM(sale_price), 0) as revenue
       FROM sales
       WHERE user_id = $1
         AND sale_date >= CURRENT_DATE - INTERVAL '7 days'
         AND status = 'completed'`,
      [userId]
    );

    // Get this month's sales
    const monthResult = await query(
      `SELECT
        COUNT(*) as count,
        COALESCE(SUM(sale_price), 0) as revenue
       FROM sales
       WHERE user_id = $1
         AND sale_date >= CURRENT_DATE - INTERVAL '30 days'
         AND status = 'completed'`,
      [userId]
    );

    // Get all-time stats
    const allTimeResult = await query(
      `SELECT
        COUNT(*) as count,
        COALESCE(SUM(sale_price), 0) as revenue,
        COALESCE(AVG(sale_price), 0) as average_price
       FROM sales
       WHERE user_id = $1
         AND status = 'completed'`,
      [userId]
    );

    // Get recent sales
    const recentResult = await query(
      `SELECT *
       FROM sales
       WHERE user_id = $1
       ORDER BY sale_date DESC, created_at DESC
       LIMIT 5`,
      [userId]
    );

    // Get active listings count
    const activeListingsResult = await query(
      `SELECT COUNT(*) as count
       FROM listings
       WHERE user_id = $1
         AND status = 'published'
         AND deleted_at IS NULL`,
      [userId]
    );

    res.status(200).json({
      success: true,
      data: {
        today: {
          sales: parseInt(todayResult.rows[0].count),
          revenue: parseFloat(todayResult.rows[0].revenue)
        },
        week: {
          sales: parseInt(weekResult.rows[0].count),
          revenue: parseFloat(weekResult.rows[0].revenue)
        },
        month: {
          sales: parseInt(monthResult.rows[0].count),
          revenue: parseFloat(monthResult.rows[0].revenue)
        },
        allTime: {
          sales: parseInt(allTimeResult.rows[0].count),
          revenue: parseFloat(allTimeResult.rows[0].revenue),
          averagePrice: parseFloat(allTimeResult.rows[0].average_price)
        },
        recentSales: recentResult.rows,
        activeListings: parseInt(activeListingsResult.rows[0].count)
      },
      statusCode: 200,
    });
  } catch (error: any) {
    logger.error('Get sales dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sales dashboard',
      statusCode: 500,
    });
  }
};

export default {
  markListingAsSold,
  getSalesDashboard,
};
