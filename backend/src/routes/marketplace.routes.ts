import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { logger } from '../config/logger';
import { query } from '../database/connection';
import {
  getUserMarketplaces,
  initiateEbayOAuth,
  handleEbayOAuthCallback,
  initiateEtsyOAuth,
  handleEtsyOAuthCallback,
  disconnectMarketplace,
  getMarketplaceStatus,
  connectManualMarketplace,
} from '../controllers/marketplaceController';
import bulkMarketplaceSignupController from '../controllers/bulkMarketplaceSignupController';
import marketplaceAutomationService from '../services/marketplaceAutomationService';

const router = Router();

/**
 * @route   GET /api/v1/marketplaces
 * @desc    Get available marketplaces
 * @access  Public
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      success: true,
      data: [
        { name: 'eBay', id: 'ebay' },
        { name: 'Facebook Marketplace', id: 'facebook' },
        { name: 'Craigslist', id: 'craigslist' },
        { name: 'Amazon', id: 'amazon' },
        { name: 'Mercari', id: 'mercari' },
        { name: 'Poshmark', id: 'poshmark' },
        { name: 'Letgo', id: 'letgo' },
        { name: 'OfferUp', id: 'offerup' },
        { name: 'Etsy', id: 'etsy' },
        { name: 'Pinterest Shop', id: 'pinterest' },
        { name: 'eBid', id: 'ebid' },
        { name: 'WhatNot', id: 'whatnot' },
        { name: 'StockX', id: 'stockx' },
        { name: 'Depop', id: 'depop' },
        { name: 'Vinted', id: 'vinted' },
        { name: 'Grailed', id: 'grailed' },
        { name: 'Ruby Lane', id: 'rubylane' },
        { name: 'Reverb', id: 'reverb' },
        { name: 'Discogs', id: 'discogs' },
        { name: 'Shopify', id: 'shopify' }
      ],
      statusCode: 200
    });
  } catch (error) {
    logger.error('Get marketplaces error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch marketplaces',
      statusCode: 500
    });
  }
});

/**
 * @route   GET /api/v1/marketplaces/available
 * @desc    Get list of available marketplaces for bulk signup
 * @access  Public
 */
router.get('/available', bulkMarketplaceSignupController.getAvailableMarketplaces);

/**
 * @route   POST /api/v1/marketplaces/bulk-signup
 * @desc    Bulk signup to multiple marketplaces (DEPRECATED - use /bulk-connect)
 * @access  Private
 */
router.post('/bulk-signup', authenticate, bulkMarketplaceSignupController.bulkSignupToMarketplaces);

/**
 * @route   POST /api/v1/marketplaces/bulk-connect
 * @desc    Connect to multiple marketplaces with individual credentials
 * @access  Private
 */
router.post('/bulk-connect', authenticate, bulkMarketplaceSignupController.bulkConnectMarketplaces);

/**
 * @route   POST /api/v1/marketplaces/:marketplace/connect
 * @desc    Connect user account to marketplace (manual credentials)
 * @access  Private
 */
router.post('/:marketplace/connect', authenticate, connectManualMarketplace);

/**
 * @route   GET /api/v1/marketplaces/:marketplace/accounts
 * @desc    Get user's accounts for a marketplace
 * @access  Private
 */
router.get('/:marketplace/accounts', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { marketplace } = req.params;

    // Capitalize first letter to match database convention
    const marketplaceName = marketplace.charAt(0).toUpperCase() + marketplace.slice(1).toLowerCase();

    // Fetch marketplace accounts for this user
    const result = await query(
      `SELECT
        id,
        marketplace_name,
        account_name,
        is_active,
        auto_sync_enabled,
        last_sync_at,
        created_at
       FROM marketplace_accounts
       WHERE user_id = $1
       AND LOWER(marketplace_name) = LOWER($2)
       AND is_active = true`,
      [userId, marketplace]
    );

    const accounts = result.rows.map((row: any) => ({
      id: row.id,
      marketplace: row.marketplace_name,
      accountName: row.account_name,
      isActive: row.is_active,
      autoSyncEnabled: row.auto_sync_enabled,
      lastSync: row.last_sync_at,
      connectedAt: row.created_at,
    }));

    res.status(200).json({
      success: true,
      data: accounts,
      statusCode: 200
    });
  } catch (error) {
    logger.error('Get accounts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch accounts',
      statusCode: 500
    });
  }
});

/**
 * @route   POST /api/v1/marketplaces/:marketplace/post-listing
 * @desc    Post listing to a specific marketplace
 * @access  Private
 */
router.post('/:marketplace/post-listing', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { marketplace } = req.params;
    const { listingId, city, zipcode, skipWatermark } = req.body;

    if (!listingId) {
      return res.status(400).json({
        success: false,
        error: 'Listing ID is required',
        statusCode: 400
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
        statusCode: 404
      });
    }

    // Use the marketplace automation service to post
    const result = await marketplaceAutomationService.publishToMarketplaces(
      listingId,
      userId,
      [marketplace],
      { city, zipcode, skipWatermark }
    );

    const marketplaceResult = result.results[0];

    if (marketplaceResult?.success) {
      res.status(201).json({
        success: true,
        message: `Listing posted to ${marketplace}`,
        data: {
          marketplace: marketplaceResult.marketplace,
          listingId: marketplaceResult.listingId,
          url: marketplaceResult.url,
          requiresVerification: marketplaceResult.requiresVerification,
        },
        statusCode: 201
      });
    } else {
      // Check if copy/paste data is available (for marketplaces without automation)
      const hasCopyPasteData = marketplaceResult?.copyPasteData;

      res.status(hasCopyPasteData ? 200 : 400).json({
        success: hasCopyPasteData,
        message: hasCopyPasteData
          ? `Manual posting required for ${marketplace}. Use the provided data.`
          : marketplaceResult?.error || `Failed to post to ${marketplace}`,
        data: hasCopyPasteData ? {
          marketplace: marketplaceResult.marketplace,
          copyPasteData: marketplaceResult.copyPasteData,
          automationUnavailable: true,
        } : undefined,
        error: !hasCopyPasteData ? marketplaceResult?.error : undefined,
        statusCode: hasCopyPasteData ? 200 : 400
      });
    }
  } catch (error: any) {
    logger.error('Post listing error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to post listing',
      statusCode: 500
    });
  }
});

/**
 * @route   GET /api/v1/marketplaces/connected
 * @desc    Get user's connected marketplaces
 * @access  Private
 */
router.get('/connected', authenticate, getUserMarketplaces);

/**
 * @route   GET /api/v1/marketplaces/ebay/connect
 * @desc    Initiate eBay OAuth flow
 * @access  Private
 */
router.get('/ebay/connect', authenticate, initiateEbayOAuth);

/**
 * @route   GET /api/v1/marketplaces/ebay/callback
 * @desc    Handle eBay OAuth callback
 * @access  Public (callback from eBay)
 */
router.get('/ebay/callback', handleEbayOAuthCallback);

/**
 * @route   GET /api/v1/marketplaces/etsy/connect
 * @desc    Initiate Etsy OAuth flow
 * @access  Private
 */
router.get('/etsy/connect', authenticate, initiateEtsyOAuth);

/**
 * @route   GET /api/v1/marketplaces/etsy/callback
 * @desc    Handle Etsy OAuth callback
 * @access  Public (callback from Etsy)
 */
router.get('/etsy/callback', handleEtsyOAuthCallback);

/**
 * @route   POST /api/v1/marketplaces/:marketplace/disconnect
 * @desc    Disconnect marketplace
 * @access  Private
 */
router.post('/:marketplace/disconnect', authenticate, disconnectMarketplace);

/**
 * @route   GET /api/v1/marketplaces/:marketplace/status
 * @desc    Get marketplace connection status
 * @access  Private
 */
router.get('/:marketplace/status', authenticate, getMarketplaceStatus);

/**
 * @route   POST /api/v1/marketplaces/bulk-post
 * @desc    Post listing to multiple marketplaces at once
 * @access  Private
 */
router.post('/bulk-post', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { listingId, marketplaces, city, zipcode, skipWatermark } = req.body;

    if (!listingId) {
      return res.status(400).json({
        success: false,
        error: 'Listing ID is required',
        statusCode: 400
      });
    }

    if (!marketplaces || !Array.isArray(marketplaces) || marketplaces.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one marketplace is required',
        statusCode: 400
      });
    }

    // Verify listing belongs to user
    const listingResult = await query(
      'SELECT id, title FROM listings WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
      [listingId, userId]
    );

    if (listingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Listing not found',
        statusCode: 404
      });
    }

    // Use the marketplace automation service to post to all marketplaces
    const result = await marketplaceAutomationService.publishToMarketplaces(
      listingId,
      userId,
      marketplaces,
      { city, zipcode, skipWatermark }
    );

    // Categorize results
    const successfulPosts = result.results.filter(r => r.success && !r.copyPasteData);
    const manualRequired = result.results.filter(r => r.copyPasteData);
    const failed = result.results.filter(r => !r.success && !r.copyPasteData);

    res.status(200).json({
      success: result.overallSuccess,
      message: `Posted to ${successfulPosts.length} marketplaces, ${manualRequired.length} require manual posting, ${failed.length} failed`,
      data: {
        listing: {
          id: listingId,
          title: listingResult.rows[0].title,
        },
        results: result.results.map(r => ({
          marketplace: r.marketplace,
          success: r.success,
          listingId: r.listingId,
          url: r.url,
          requiresVerification: r.requiresVerification,
          error: r.error,
          copyPasteData: r.copyPasteData,
        })),
        summary: {
          total: marketplaces.length,
          successful: successfulPosts.length,
          manualRequired: manualRequired.length,
          failed: failed.length,
        },
      },
      statusCode: 200
    });
  } catch (error: any) {
    logger.error('Bulk post error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to post listings',
      statusCode: 500
    });
  }
});

export default router;
