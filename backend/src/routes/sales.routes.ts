import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { logger } from '../config/logger';
import { query } from '../database/connection';

const router = Router();

/**
 * @route   GET /api/v1/sales
 * @desc    Get all sales for authenticated user
 * @access  Private
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const result = await query(
      `SELECT
        id,
        listing_id,
        listing_title,
        marketplace,
        sale_price,
        sale_date,
        buyer_name,
        buyer_email,
        transaction_id,
        status,
        notes,
        created_at
      FROM sales
      WHERE user_id = $1
      ORDER BY sale_date DESC, created_at DESC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      data: result.rows,
      statusCode: 200
    });
  } catch (error) {
    logger.error('Get sales error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sales',
      statusCode: 500
    });
  }
});

/**
 * @route   POST /api/v1/sales/manual
 * @desc    Create manual sale entry
 * @access  Private
 */
router.post('/manual', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const {
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
    } = req.body;

    // Validation
    if (!listing_title || !marketplace || !sale_price) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: listing_title, marketplace, sale_price',
        statusCode: 400
      });
    }

    // Validate sale_price is a positive number
    const price = parseFloat(sale_price);
    if (isNaN(price) || price < 0) {
      return res.status(400).json({
        success: false,
        error: 'Sale price must be a valid positive number',
        statusCode: 400
      });
    }

    const result = await query(
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
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        userId,
        listing_id || null,
        listing_title,
        marketplace,
        price,
        sale_date || new Date().toISOString().split('T')[0],
        buyer_name || null,
        buyer_email || null,
        transaction_id || null,
        status || 'completed',
        notes || null
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Sale recorded successfully',
      statusCode: 201
    });
  } catch (error: any) {
    logger.error('Create manual sale error:', error);

    // Handle specific database errors
    if (error.code === '23503') {
      return res.status(400).json({
        success: false,
        error: 'Invalid listing_id or user_id',
        statusCode: 400
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create sale record',
      statusCode: 500
    });
  }
});

/**
 * @route   GET /api/v1/sales/:id
 * @desc    Get specific sale details
 * @access  Private
 */
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const result = await query(
      `SELECT
        id,
        listing_id,
        listing_title,
        marketplace,
        sale_price,
        sale_date,
        buyer_name,
        buyer_email,
        transaction_id,
        status,
        notes,
        created_at,
        updated_at
      FROM sales
      WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Sale not found',
        statusCode: 404
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
      statusCode: 200
    });
  } catch (error) {
    logger.error('Get sale error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sale',
      statusCode: 500
    });
  }
});

/**
 * @route   PUT /api/v1/sales/:id
 * @desc    Update sale details
 * @access  Private
 */
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const {
      listing_title,
      marketplace,
      sale_price,
      sale_date,
      buyer_name,
      buyer_email,
      transaction_id,
      status,
      notes
    } = req.body;

    // First check if sale exists and belongs to user
    const checkResult = await query(
      'SELECT id FROM sales WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Sale not found',
        statusCode: 404
      });
    }

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (listing_title !== undefined) {
      updates.push(`listing_title = $${paramCount++}`);
      values.push(listing_title);
    }
    if (marketplace !== undefined) {
      updates.push(`marketplace = $${paramCount++}`);
      values.push(marketplace);
    }
    if (sale_price !== undefined) {
      const price = parseFloat(sale_price);
      if (isNaN(price) || price < 0) {
        return res.status(400).json({
          success: false,
          error: 'Sale price must be a valid positive number',
          statusCode: 400
        });
      }
      updates.push(`sale_price = $${paramCount++}`);
      values.push(price);
    }
    if (sale_date !== undefined) {
      updates.push(`sale_date = $${paramCount++}`);
      values.push(sale_date);
    }
    if (buyer_name !== undefined) {
      updates.push(`buyer_name = $${paramCount++}`);
      values.push(buyer_name);
    }
    if (buyer_email !== undefined) {
      updates.push(`buyer_email = $${paramCount++}`);
      values.push(buyer_email);
    }
    if (transaction_id !== undefined) {
      updates.push(`transaction_id = $${paramCount++}`);
      values.push(transaction_id);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }
    if (notes !== undefined) {
      updates.push(`notes = $${paramCount++}`);
      values.push(notes);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update',
        statusCode: 400
      });
    }

    values.push(id, userId);

    const result = await query(
      `UPDATE sales
       SET ${updates.join(', ')}
       WHERE id = $${paramCount++} AND user_id = $${paramCount}
       RETURNING *`,
      values
    );

    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: 'Sale updated successfully',
      statusCode: 200
    });
  } catch (error) {
    logger.error('Update sale error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update sale',
      statusCode: 500
    });
  }
});

/**
 * @route   DELETE /api/v1/sales/:id
 * @desc    Delete sale
 * @access  Private
 */
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const result = await query(
      'DELETE FROM sales WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Sale not found',
        statusCode: 404
      });
    }

    res.status(200).json({
      success: true,
      message: 'Sale deleted successfully',
      statusCode: 200
    });
  } catch (error) {
    logger.error('Delete sale error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete sale',
      statusCode: 500
    });
  }
});

/**
 * @route   POST /api/v1/sales/:id/mark-complete
 * @desc    Mark sale as completed
 * @access  Private
 */
router.post('/:id/mark-complete', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const result = await query(
      `UPDATE sales
       SET status = 'completed'
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Sale not found',
        statusCode: 404
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: 'Sale marked as completed',
      statusCode: 200
    });
  } catch (error) {
    logger.error('Mark complete error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark sale as complete',
      statusCode: 500
    });
  }
});

/**
 * @route   GET /api/v1/sales/analytics
 * @desc    Get sales analytics and statistics
 * @access  Private
 */
router.get('/analytics', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Get total sales stats
    const statsResult = await query(
      `SELECT
        COUNT(*) as total_sales,
        COALESCE(SUM(sale_price), 0) as total_revenue,
        COALESCE(AVG(sale_price), 0) as average_sale_price,
        MAX(sale_price) as highest_sale,
        MIN(sale_price) as lowest_sale
      FROM sales
      WHERE user_id = $1 AND status = 'completed'`,
      [userId]
    );

    // Get sales by marketplace
    const marketplaceResult = await query(
      `SELECT
        marketplace,
        COUNT(*) as count,
        COALESCE(SUM(sale_price), 0) as revenue
      FROM sales
      WHERE user_id = $1 AND status = 'completed'
      GROUP BY marketplace
      ORDER BY revenue DESC`,
      [userId]
    );

    // Get sales trend (last 30 days)
    const trendResult = await query(
      `SELECT
        DATE(sale_date) as date,
        COUNT(*) as sales_count,
        COALESCE(SUM(sale_price), 0) as revenue
      FROM sales
      WHERE user_id = $1
        AND status = 'completed'
        AND sale_date >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(sale_date)
      ORDER BY date DESC`,
      [userId]
    );

    const stats = statsResult.rows[0];

    res.status(200).json({
      success: true,
      data: {
        totalSales: parseInt(stats.total_sales),
        totalRevenue: parseFloat(stats.total_revenue),
        averageSalePrice: parseFloat(stats.average_sale_price),
        highestSale: parseFloat(stats.highest_sale) || 0,
        lowestSale: parseFloat(stats.lowest_sale) || 0,
        byMarketplace: marketplaceResult.rows,
        trend: trendResult.rows
      },
      statusCode: 200
    });
  } catch (error) {
    logger.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics',
      statusCode: 500
    });
  }
});

export default router;
