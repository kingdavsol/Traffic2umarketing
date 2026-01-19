import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { logger } from '../config/logger';
import { query } from '../database/connection';

const router = Router();

// Category base prices (median prices based on typical marketplace data)
const CATEGORY_BASE_PRICES: Record<string, { min: number; median: number; max: number }> = {
  electronics: { min: 25, median: 150, max: 500 },
  clothing: { min: 10, median: 35, max: 150 },
  shoes: { min: 15, median: 50, max: 200 },
  furniture: { min: 30, median: 150, max: 800 },
  toys: { min: 5, median: 25, max: 100 },
  books: { min: 3, median: 12, max: 50 },
  sports: { min: 15, median: 60, max: 300 },
  home: { min: 10, median: 40, max: 200 },
  beauty: { min: 5, median: 25, max: 100 },
  jewelry: { min: 15, median: 75, max: 500 },
  collectibles: { min: 10, median: 50, max: 1000 },
  automotive: { min: 20, median: 100, max: 500 },
  musical_instruments: { min: 50, median: 200, max: 1500 },
  art: { min: 20, median: 100, max: 2000 },
  antiques: { min: 25, median: 150, max: 3000 },
  other: { min: 10, median: 40, max: 200 },
};

// Condition multipliers
const CONDITION_MULTIPLIERS: Record<string, number> = {
  new: 1.0,
  like_new: 0.90,
  excellent: 0.80,
  good: 0.65,
  fair: 0.45,
  poor: 0.25,
};

// Premium brand multipliers
const PREMIUM_BRANDS: Record<string, number> = {
  apple: 1.4,
  sony: 1.2,
  samsung: 1.15,
  nike: 1.3,
  adidas: 1.2,
  gucci: 2.0,
  louis_vuitton: 2.5,
  rolex: 3.0,
  nintendo: 1.25,
  dyson: 1.35,
  kitchenaid: 1.3,
  levis: 1.15,
  coach: 1.4,
  north_face: 1.25,
};

// Market trend data (would be fetched from real-time data in production)
const MARKET_TRENDS: Record<string, { demand: string; trend: string; seasonality: number }> = {
  electronics: { demand: 'high', trend: 'stable', seasonality: 1.1 },
  clothing: { demand: 'medium', trend: 'stable', seasonality: 1.0 },
  shoes: { demand: 'medium', trend: 'increasing', seasonality: 1.05 },
  furniture: { demand: 'high', trend: 'increasing', seasonality: 1.0 },
  toys: { demand: 'high', trend: 'seasonal', seasonality: 1.3 }, // Holiday boost
  books: { demand: 'low', trend: 'declining', seasonality: 0.95 },
  sports: { demand: 'medium', trend: 'stable', seasonality: 1.1 },
  collectibles: { demand: 'high', trend: 'increasing', seasonality: 1.0 },
};

/**
 * Analyze title for brand and keywords
 */
function analyzeTitle(title: string): { brand: string | null; keywords: string[] } {
  const titleLower = title.toLowerCase();
  let detectedBrand: string | null = null;

  // Check for premium brands
  for (const brand of Object.keys(PREMIUM_BRANDS)) {
    if (titleLower.includes(brand.replace('_', ' '))) {
      detectedBrand = brand;
      break;
    }
  }

  // Extract keywords (simple word extraction)
  const keywords = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3);

  return { brand: detectedBrand, keywords };
}

/**
 * @route   GET /api/v1/pricing/estimate/:category
 * @desc    Get price estimate for item based on category, condition, and title
 * @access  Private
 */
router.get('/estimate/:category', authenticate, async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const { title, condition, brand } = req.query;

    const categoryKey = (category || 'other').toLowerCase().replace(/\s+/g, '_');
    const conditionKey = (condition as string || 'good').toLowerCase().replace(/\s+/g, '_');

    // Get base price for category
    const basePrices = CATEGORY_BASE_PRICES[categoryKey] || CATEGORY_BASE_PRICES.other;
    let estimatedPrice = basePrices.median;

    // Apply condition multiplier
    const conditionMultiplier = CONDITION_MULTIPLIERS[conditionKey] || CONDITION_MULTIPLIERS.good;
    estimatedPrice *= conditionMultiplier;

    // Analyze title for brand and adjustments
    let brandMultiplier = 1.0;
    let titleAnalysis = { brand: null as string | null, keywords: [] as string[] };

    if (title) {
      titleAnalysis = analyzeTitle(title as string);
      if (titleAnalysis.brand) {
        brandMultiplier = PREMIUM_BRANDS[titleAnalysis.brand] || 1.0;
      }
    }

    // Override with explicit brand if provided
    if (brand) {
      const brandKey = (brand as string).toLowerCase().replace(/\s+/g, '_');
      if (PREMIUM_BRANDS[brandKey]) {
        brandMultiplier = PREMIUM_BRANDS[brandKey];
      }
    }

    estimatedPrice *= brandMultiplier;

    // Apply market trend seasonality
    const marketTrend = MARKET_TRENDS[categoryKey] || { seasonality: 1.0 };
    estimatedPrice *= marketTrend.seasonality;

    // Calculate price range
    const variability = 0.25; // 25% variability
    const minPrice = Math.max(basePrices.min, Math.round(estimatedPrice * (1 - variability)));
    const maxPrice = Math.min(basePrices.max * brandMultiplier, Math.round(estimatedPrice * (1 + variability)));

    // Round estimated price
    estimatedPrice = Math.round(estimatedPrice);

    // Calculate confidence based on factors
    let confidence = 0.70; // Base confidence
    if (title && (title as string).length > 10) confidence += 0.10;
    if (titleAnalysis.brand) confidence += 0.10;
    if (condition) confidence += 0.05;
    confidence = Math.min(0.95, confidence);

    // Get historical data from database for similar items
    let historicalData = null;
    try {
      const historyResult = await query(
        `SELECT
          AVG(price) as avg_price,
          MIN(price) as min_price,
          MAX(price) as max_price,
          COUNT(*) as count
         FROM listings
         WHERE LOWER(category) = $1
         AND deleted_at IS NULL
         AND price > 0`,
        [categoryKey]
      );

      if (historyResult.rows[0] && historyResult.rows[0].count > 0) {
        historicalData = {
          averagePrice: parseFloat(historyResult.rows[0].avg_price) || null,
          minPrice: parseFloat(historyResult.rows[0].min_price) || null,
          maxPrice: parseFloat(historyResult.rows[0].max_price) || null,
          sampleSize: parseInt(historyResult.rows[0].count),
        };

        // Blend estimate with historical data
        if (historicalData.averagePrice && historicalData.sampleSize >= 5) {
          estimatedPrice = Math.round((estimatedPrice * 0.6) + (historicalData.averagePrice * conditionMultiplier * 0.4));
          confidence = Math.min(0.95, confidence + 0.05);
        }
      }
    } catch (dbError) {
      logger.warn('Could not fetch historical pricing data:', dbError);
    }

    res.status(200).json({
      success: true,
      data: {
        estimatedPrice,
        priceRange: { min: minPrice, max: maxPrice },
        confidence,
        factors: {
          category: categoryKey,
          condition: conditionKey,
          conditionMultiplier,
          brand: titleAnalysis.brand || brand || null,
          brandMultiplier,
          seasonality: marketTrend.seasonality,
        },
        historicalData,
        recommendation: estimatedPrice < 20
          ? 'Consider bundling with similar items to increase value'
          : estimatedPrice > 200
          ? 'High-value item - ensure photos show all details and include original packaging if available'
          : 'Price is competitive for this category',
      },
      statusCode: 200,
    });
  } catch (error) {
    logger.error('Price estimation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to estimate price',
      statusCode: 500,
    });
  }
});

/**
 * @route   GET /api/v1/pricing/similar-items/:category
 * @desc    Get similar items and their prices from user's listings and sales history
 * @access  Private
 */
router.get('/similar-items/:category', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { category } = req.params;
    const { title, limit = 10 } = req.query;

    const categoryKey = category.toLowerCase().replace(/\s+/g, '_');

    // Get similar items from listings
    let queryText = `
      SELECT
        id,
        title,
        category,
        price,
        condition,
        status,
        created_at,
        (SELECT COUNT(*) FROM sales s WHERE s.listing_id = l.id AND s.status = 'completed') as sold_count
      FROM listings l
      WHERE LOWER(category) = $1
      AND deleted_at IS NULL
      AND price > 0
    `;
    const params: any[] = [categoryKey];

    // Add title similarity search if provided
    if (title) {
      queryText += ` AND (LOWER(title) LIKE $${params.length + 1} OR LOWER(description) LIKE $${params.length + 1})`;
      params.push(`%${(title as string).toLowerCase()}%`);
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(Number(limit));

    const result = await query(queryText, params);

    const similarItems = result.rows.map((item: any) => ({
      id: item.id,
      title: item.title,
      category: item.category,
      price: parseFloat(item.price),
      condition: item.condition,
      status: item.status,
      sold: item.sold_count > 0,
      createdAt: item.created_at,
    }));

    // Calculate stats
    const prices = similarItems.map((i: any) => i.price).filter((p: number) => p > 0);
    const stats = prices.length > 0 ? {
      averagePrice: Math.round(prices.reduce((a: number, b: number) => a + b, 0) / prices.length),
      lowestPrice: Math.min(...prices),
      highestPrice: Math.max(...prices),
      medianPrice: prices.sort((a: number, b: number) => a - b)[Math.floor(prices.length / 2)],
      itemCount: prices.length,
    } : null;

    res.status(200).json({
      success: true,
      data: {
        items: similarItems,
        stats,
        category: categoryKey,
      },
      statusCode: 200,
    });
  } catch (error) {
    logger.error('Similar items error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch similar items',
      statusCode: 500,
    });
  }
});

/**
 * @route   GET /api/v1/pricing/market-data/:category
 * @desc    Get market data and trends for a category
 * @access  Private
 */
router.get('/market-data/:category', authenticate, async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const categoryKey = category.toLowerCase().replace(/\s+/g, '_');

    // Get category pricing data
    const basePrices = CATEGORY_BASE_PRICES[categoryKey] || CATEGORY_BASE_PRICES.other;
    const trend = MARKET_TRENDS[categoryKey] || { demand: 'medium', trend: 'stable', seasonality: 1.0 };

    // Get sales data from database
    let salesData = null;
    try {
      const salesResult = await query(
        `SELECT
          COUNT(*) as total_sales,
          AVG(sale_price) as avg_sale_price,
          SUM(sale_price) as total_revenue,
          AVG(EXTRACT(EPOCH FROM (s.created_at - l.created_at)) / 86400) as avg_days_to_sell
         FROM sales s
         JOIN listings l ON s.listing_id = l.id
         WHERE LOWER(l.category) = $1
         AND s.status = 'completed'
         AND s.created_at > NOW() - INTERVAL '90 days'`,
        [categoryKey]
      );

      if (salesResult.rows[0] && salesResult.rows[0].total_sales > 0) {
        salesData = {
          totalSales: parseInt(salesResult.rows[0].total_sales),
          averageSalePrice: parseFloat(salesResult.rows[0].avg_sale_price) || null,
          totalRevenue: parseFloat(salesResult.rows[0].total_revenue) || 0,
          averageDaysToSell: Math.round(parseFloat(salesResult.rows[0].avg_days_to_sell)) || null,
        };
      }
    } catch (dbError) {
      logger.warn('Could not fetch sales data:', dbError);
    }

    // Get listing activity
    let listingActivity = null;
    try {
      const activityResult = await query(
        `SELECT
          COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as last_7_days,
          COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as last_30_days,
          COUNT(*) as total
         FROM listings
         WHERE LOWER(category) = $1
         AND deleted_at IS NULL`,
        [categoryKey]
      );

      if (activityResult.rows[0]) {
        listingActivity = {
          last7Days: parseInt(activityResult.rows[0].last_7_days),
          last30Days: parseInt(activityResult.rows[0].last_30_days),
          total: parseInt(activityResult.rows[0].total),
        };
      }
    } catch (dbError) {
      logger.warn('Could not fetch listing activity:', dbError);
    }

    // Best times to sell (general guidance)
    const bestTimesToSell = {
      electronics: 'Black Friday, holiday season, back to school',
      clothing: 'Season transitions (spring/fall)',
      toys: 'Holiday season (November-December)',
      furniture: 'Spring and summer moving season',
      sports: 'Start of sports seasons',
      books: 'Back to school, January',
    };

    res.status(200).json({
      success: true,
      data: {
        category: categoryKey,
        priceRange: basePrices,
        marketTrend: {
          demand: trend.demand,
          priceDirection: trend.trend,
          seasonalMultiplier: trend.seasonality,
          bestTimeToSell: bestTimesToSell[categoryKey as keyof typeof bestTimesToSell] || 'Year-round demand',
        },
        salesData,
        listingActivity,
        insights: [
          trend.demand === 'high' ? `High demand for ${category} items - consider pricing slightly above average` : null,
          trend.trend === 'increasing' ? 'Prices trending upward - good time to sell' : null,
          trend.trend === 'declining' ? 'Prices trending downward - price competitively for quick sale' : null,
          trend.seasonality > 1.1 ? 'Currently in peak season - capitalize on higher demand' : null,
        ].filter(Boolean),
      },
      statusCode: 200,
    });
  } catch (error) {
    logger.error('Market data error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market data',
      statusCode: 500,
    });
  }
});

export default router;
