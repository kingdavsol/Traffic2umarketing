import { query } from '../database/connection';
import { logger } from '../config/logger';

export const createListing = async (userId: number, listingData: any) => {
  try {
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
    } = listingData;

    const result = await query(
      `INSERT INTO listings 
      (user_id, title, description, category, price, condition, brand, model, color, size, status) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
      RETURNING *`,
      [
        userId,
        title,
        description,
        category,
        price,
        condition,
        brand,
        model,
        color,
        size,
        'draft',
      ]
    );
    return result.rows[0];
  } catch (error) {
    logger.error('Create listing error:', error);
    throw error;
  }
};

export const getListings = async (userId: number, page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;

    const result = await query(
      'SELECT * FROM listings WHERE user_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [userId, limit, offset]
    );

    const countResult = await query('SELECT COUNT(*) FROM listings WHERE user_id = $1 AND deleted_at IS NULL', [
      userId,
    ]);

    return {
      listings: result.rows,
      total: parseInt(countResult.rows[0].count, 10),
    };
  } catch (error) {
    logger.error('Get listings error:', error);
    throw error;
  }
};

export const getListing = async (id: number, userId: number) => {
  try {
    const result = await query(
      'SELECT * FROM listings WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
      [id, userId]
    );
    return result.rows[0];
  } catch (error) {
    logger.error('Get listing error:', error);
    throw error;
  }
};

export const updateListing = async (id: number, userId: number, updateData: any) => {
  try {
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);
    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');

    const result = await query(
      `UPDATE listings SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} AND user_id = $${fields.length + 2} RETURNING *`,
      [...values, id, userId]
    );
    return result.rows[0];
  } catch (error) {
    logger.error('Update listing error:', error);
    throw error;
  }
};

export const publishListing = async (id: number, userId: number) => {
  try {
    const result = await query(
      'UPDATE listings SET status = $1, published_at = NOW(), updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING *',
      ['published', id, userId]
    );
    return result.rows[0];
  } catch (error) {
    logger.error('Publish listing error:', error);
    throw error;
  }
};

export const deleteListing = async (id: number, userId: number) => {
  try {
    const result = await query(
      'UPDATE listings SET deleted_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );
    return result.rows[0];
  } catch (error) {
    logger.error('Delete listing error:', error);
    throw error;
  }
};
