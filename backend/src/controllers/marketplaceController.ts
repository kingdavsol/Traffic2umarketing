import { Request, Response } from 'express';
import { logger } from '../config/logger';
import { query } from '../database/connection';
import { getConnectedMarketplaces } from '../services/marketplaceService';

/**
 * Get user's connected marketplaces
 */
export const getUserMarketplaces = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const marketplaces = await getConnectedMarketplaces(userId);

    res.status(200).json({
      success: true,
      data: marketplaces,
      statusCode: 200,
    });
  } catch (error) {
    logger.error('Get connected marketplaces error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch connected marketplaces',
      statusCode: 500,
    });
  }
};

/**
 * Initiate eBay OAuth flow
 */
export const initiateEbayOAuth = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    // eBay OAuth URLs (Sandbox or Production)
    const ebayAuthUrl = process.env.EBAY_OAUTH_URL || 'https://auth.ebay.com/oauth2/authorize';
    const clientId = process.env.EBAY_CLIENT_ID;
    const redirectUri = process.env.EBAY_REDIRECT_URI || `${process.env.API_URL}/api/v1/marketplaces/ebay/callback`;
    const scope = 'https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.marketing https://api.ebay.com/oauth/api_scope/sell.account https://api.ebay.com/oauth/api_scope/sell.fulfillment';

    if (!clientId) {
      return res.status(500).json({
        success: false,
        error: 'eBay OAuth is not configured. Please set EBAY_CLIENT_ID environment variable.',
        statusCode: 500,
      });
    }

    // Store user ID in session or temporary state
    const state = Buffer.from(JSON.stringify({ userId, timestamp: Date.now() })).toString('base64');

    // Build authorization URL
    const authUrl = `${ebayAuthUrl}?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;

    // Redirect to eBay OAuth
    res.redirect(authUrl);
  } catch (error) {
    logger.error('eBay OAuth initiation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate eBay OAuth',
      statusCode: 500,
    });
  }
};

/**
 * Handle eBay OAuth callback
 */
export const handleEbayOAuthCallback = async (req: Request, res: Response) => {
  try {
    const { code, state, error: oauthError } = req.query;

    if (oauthError) {
      logger.error('eBay OAuth error:', oauthError);
      return res.redirect(`/settings/marketplaces?error=${oauthError}`);
    }

    if (!code || !state) {
      return res.redirect('/settings/marketplaces?error=missing_parameters');
    }

    // Decode state to get user ID
    const stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
    const userId = stateData.userId;

    // Exchange code for access token
    const tokenUrl = process.env.EBAY_TOKEN_URL || 'https://api.ebay.com/identity/v1/oauth2/token';
    const clientId = process.env.EBAY_CLIENT_ID;
    const clientSecret = process.env.EBAY_CLIENT_SECRET;
    const redirectUri = process.env.EBAY_REDIRECT_URI || `${process.env.API_URL}/api/v1/marketplaces/ebay/callback`;

    if (!clientId || !clientSecret) {
      return res.redirect('/settings/marketplaces?error=oauth_not_configured');
    }

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      logger.error('eBay token exchange failed:', errorData);
      return res.redirect('/settings/marketplaces?error=token_exchange_failed');
    }

    const tokenData: any = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // Save to database
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    await query(
      `INSERT INTO marketplace_accounts
       (user_id, marketplace_name, account_name, access_token, refresh_token, token_expires_at, is_active, auto_sync_enabled)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (user_id, marketplace_name)
       DO UPDATE SET
         access_token = EXCLUDED.access_token,
         refresh_token = EXCLUDED.refresh_token,
         token_expires_at = EXCLUDED.token_expires_at,
         is_active = true,
         last_sync_at = CURRENT_TIMESTAMP`,
      [userId, 'eBay', 'eBay Account', access_token, refresh_token, expiresAt, true, true]
    );

    logger.info(`eBay connected for user ${userId}`);

    // Redirect to success page
    res.redirect('/settings/marketplaces?success=ebay_connected');
  } catch (error: any) {
    logger.error('eBay OAuth callback error:', error);
    res.redirect('/settings/marketplaces?error=connection_failed');
  }
};

/**
 * Initiate Etsy OAuth flow
 */
export const initiateEtsyOAuth = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const apiKey = process.env.ETSY_API_KEY;
    const redirectUri = process.env.ETSY_REDIRECT_URI || `${process.env.API_URL}/api/v1/marketplaces/etsy/callback`;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'Etsy OAuth is not configured. Please set ETSY_API_KEY environment variable.',
        statusCode: 500,
      });
    }

    // Generate state with user ID
    const state = Buffer.from(JSON.stringify({ userId, timestamp: Date.now() })).toString('base64');

    // Generate code verifier and challenge for PKCE
    const codeVerifier = Buffer.from(Math.random().toString()).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 128);

    // Store code verifier temporarily (in production, use Redis or session)
    // For now, we'll include it in the state (not recommended for production)
    const stateWithVerifier = Buffer.from(JSON.stringify({ userId, codeVerifier, timestamp: Date.now() })).toString('base64');

    // Etsy OAuth URL
    const scopes = ['listings_w', 'shops_r', 'profile_r'].join('%20');
    const authUrl = `https://www.etsy.com/oauth/connect?response_type=code&client_id=${apiKey}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&state=${stateWithVerifier}&code_challenge=${codeVerifier}&code_challenge_method=S256`;

    // Redirect to Etsy OAuth
    res.redirect(authUrl);
  } catch (error) {
    logger.error('Etsy OAuth initiation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate Etsy OAuth',
      statusCode: 500,
    });
  }
};

/**
 * Handle Etsy OAuth callback
 */
export const handleEtsyOAuthCallback = async (req: Request, res: Response) => {
  try {
    const { code, state, error: oauthError } = req.query;

    if (oauthError) {
      logger.error('Etsy OAuth error:', oauthError);
      return res.redirect(`/settings/marketplaces?error=${oauthError}`);
    }

    if (!code || !state) {
      return res.redirect('/settings/marketplaces?error=missing_parameters');
    }

    // Decode state to get user ID and code verifier
    const stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
    const userId = stateData.userId;
    const codeVerifier = stateData.codeVerifier;

    // Exchange code for access token
    const apiKey = process.env.ETSY_API_KEY;
    const redirectUri = process.env.ETSY_REDIRECT_URI || `${process.env.API_URL}/api/v1/marketplaces/etsy/callback`;

    if (!apiKey) {
      return res.redirect('/settings/marketplaces?error=oauth_not_configured');
    }

    const tokenResponse = await fetch('https://api.etsy.com/v3/public/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: apiKey,
        redirect_uri: redirectUri,
        code: code as string,
        code_verifier: codeVerifier,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      logger.error('Etsy token exchange failed:', errorData);
      return res.redirect('/settings/marketplaces?error=token_exchange_failed');
    }

    const tokenData: any = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // Get shop name
    const shopResponse = await fetch('https://openapi.etsy.com/v3/application/shops', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'x-api-key': apiKey,
      },
    });

    let shopName = 'Etsy Shop';
    if (shopResponse.ok) {
      const shopData: any = await shopResponse.json();
      if (shopData.results && shopData.results.length > 0) {
        shopName = shopData.results[0].shop_name;
      }
    }

    // Save to database
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    await query(
      `INSERT INTO marketplace_accounts
       (user_id, marketplace_name, account_name, access_token, refresh_token, token_expires_at, is_active, auto_sync_enabled)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (user_id, marketplace_name)
       DO UPDATE SET
         access_token = EXCLUDED.access_token,
         refresh_token = EXCLUDED.refresh_token,
         token_expires_at = EXCLUDED.token_expires_at,
         account_name = EXCLUDED.account_name,
         is_active = true,
         last_sync_at = CURRENT_TIMESTAMP`,
      [userId, 'Etsy', shopName, access_token, refresh_token, expiresAt, true, true]
    );

    logger.info(`Etsy connected for user ${userId}: ${shopName}`);

    // Redirect to success page
    res.redirect('/settings/marketplaces?success=etsy_connected');
  } catch (error: any) {
    logger.error('Etsy OAuth callback error:', error);
    res.redirect('/settings/marketplaces?error=connection_failed');
  }
};

/**
 * Disconnect marketplace
 */
export const disconnectMarketplace = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { marketplace } = req.params;

    await query(
      'UPDATE marketplace_accounts SET is_active = false WHERE user_id = $1 AND marketplace_name = $2',
      [userId, marketplace]
    );

    logger.info(`${marketplace} disconnected for user ${userId}`);

    res.status(200).json({
      success: true,
      message: `${marketplace} disconnected successfully`,
      statusCode: 200,
    });
  } catch (error) {
    logger.error('Disconnect marketplace error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to disconnect marketplace',
      statusCode: 500,
    });
  }
};

/**
 * Get marketplace connection status
 */
export const getMarketplaceStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { marketplace } = req.params;

    const result = await query(
      'SELECT * FROM marketplace_accounts WHERE user_id = $1 AND marketplace_name = $2 AND is_active = true',
      [userId, marketplace]
    );

    const connected = result.rows.length > 0;
    const account = result.rows[0];

    res.status(200).json({
      success: true,
      data: {
        connected,
        accountName: account?.account_name,
        lastSync: account?.last_sync_at,
        autoSync: account?.auto_sync_enabled,
      },
      statusCode: 200,
    });
  } catch (error) {
    logger.error('Get marketplace status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get marketplace status',
      statusCode: 500,
    });
  }
};
