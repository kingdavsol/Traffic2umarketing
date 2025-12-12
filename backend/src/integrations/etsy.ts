/**
 * Etsy API Integration (v3)
 * Uses the Etsy Open API v3 to create and publish listings
 *
 * Etsy API Documentation: https://developers.etsy.com/documentation/
 * OAuth: https://developers.etsy.com/documentation/essentials/authentication
 */

import { logger } from '../config/logger';

const ETSY_API_BASE_URL = 'https://openapi.etsy.com/v3';

interface ListingData {
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  brand?: string;
  photos: string[];
  quantity?: number;
  sku?: string;
  tags?: string[];
}

interface EtsyListingResult {
  success: boolean;
  listingId?: string;
  listingUrl?: string;
  error?: string;
}

interface EtsyShopInfo {
  shop_id: number;
  shop_name: string;
  currency: string;
}

/**
 * Make authenticated request to Etsy API
 */
async function makeEtsyRequest(
  accessToken: string,
  endpoint: string,
  method: string = 'GET',
  body?: any
): Promise<any> {
  const url = `${ETSY_API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${accessToken}`,
    'x-api-key': process.env.ETSY_API_KEY || '',
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Etsy API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    logger.error(`Etsy API request failed: ${endpoint}`, error);
    throw error;
  }
}

/**
 * Get user's shop information
 */
export const getShopInfo = async (accessToken: string): Promise<EtsyShopInfo | null> => {
  try {
    const response = await makeEtsyRequest(accessToken, '/application/shops');

    if (response.results && response.results.length > 0) {
      const shop = response.results[0];
      return {
        shop_id: shop.shop_id,
        shop_name: shop.shop_name,
        currency: shop.currency_code,
      };
    }

    return null;
  } catch (error: any) {
    logger.error('Failed to get Etsy shop info:', error);
    return null;
  }
};

/**
 * Get shop's shipping profiles
 */
async function getShippingProfiles(
  accessToken: string,
  shopId: number
): Promise<number | null> {
  try {
    const response = await makeEtsyRequest(
      accessToken,
      `/application/shops/${shopId}/shipping-profiles`
    );

    if (response.results && response.results.length > 0) {
      // Return the first shipping profile ID
      return response.results[0].shipping_profile_id;
    }

    return null;
  } catch (error: any) {
    logger.error('Failed to get shipping profiles:', error);
    return null;
  }
}

/**
 * Upload image to Etsy listing
 */
async function uploadListingImage(
  accessToken: string,
  shopId: number,
  listingId: number,
  imageUrl: string,
  rank: number = 1
): Promise<boolean> {
  try {
    // Etsy requires images to be uploaded as multipart/form-data
    // For now, we'll use the image URL directly if Etsy supports it
    const response = await makeEtsyRequest(
      accessToken,
      `/application/shops/${shopId}/listings/${listingId}/images`,
      'POST',
      {
        image_url: imageUrl,
        rank,
      }
    );

    logger.info(`Uploaded image to Etsy listing ${listingId}: rank ${rank}`);
    return true;
  } catch (error: any) {
    logger.error(`Failed to upload image to listing ${listingId}:`, error);
    return false;
  }
}

/**
 * Map condition to Etsy condition enum
 */
function mapCondition(condition: string): string {
  const conditionMap: Record<string, string> = {
    'new': 'new',
    'like-new': 'like_new',
    'like new': 'like_new',
    'excellent': 'excellent',
    'very good': 'very_good',
    'good': 'good',
    'fair': 'fair',
    'poor': 'poor',
    'used': 'good',
  };
  return conditionMap[condition.toLowerCase()] || 'good';
}

/**
 * Map category to Etsy taxonomy ID
 * Note: Etsy has 6000+ categories. This is a simplified mapping.
 * Use Etsy's taxonomy API for production: /v3/application/seller-taxonomy/nodes
 */
function getTaxonomyId(category: string): number {
  const categoryMap: Record<string, number> = {
    // Simplified category mapping
    'Electronics': 69150308, // Electronics & Accessories
    'Clothing': 1059, // Clothing
    'Jewelry': 69150425, // Jewelry
    'Home & Garden': 1063, // Home & Living
    'Art': 67, // Art & Collectibles
    'Toys': 1063, // Toys & Games
    'Craft Supplies': 562, // Craft Supplies & Tools
    'Vintage': 100, // Vintage (catch-all)
    'Books': 69150308, // Paper & Party Supplies
  };

  for (const [key, value] of Object.entries(categoryMap)) {
    if (category.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  // Default to "Other" category
  return 69150308;
}

/**
 * Generate tags from listing data
 */
function generateTags(listingData: ListingData): string[] {
  const tags: string[] = [];

  // Add category as tag
  if (listingData.category) {
    tags.push(listingData.category.toLowerCase());
  }

  // Add brand as tag
  if (listingData.brand) {
    tags.push(listingData.brand.toLowerCase());
  }

  // Add condition as tag
  if (listingData.condition) {
    tags.push(listingData.condition.toLowerCase().replace(/[^a-z0-9]/g, ''));
  }

  // Extract keywords from title
  const titleWords = listingData.title
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3 && word.length <= 20);

  tags.push(...titleWords.slice(0, 10));

  // Add custom tags if provided
  if (listingData.tags) {
    tags.push(...listingData.tags);
  }

  // Etsy allows max 13 tags, each max 20 characters
  return tags
    .map(tag => tag.substring(0, 20).trim())
    .filter((tag, index, self) => self.indexOf(tag) === index) // Remove duplicates
    .slice(0, 13);
}

/**
 * Create a draft listing on Etsy
 */
export const createDraftListing = async (
  accessToken: string,
  shopId: number,
  listingData: ListingData
): Promise<{ success: boolean; listingId?: number; error?: string }> => {
  try {
    // Get shipping profile
    const shippingProfileId = await getShippingProfiles(accessToken, shopId);
    if (!shippingProfileId) {
      return {
        success: false,
        error: 'No shipping profile found. Please create a shipping profile in your Etsy shop settings.',
      };
    }

    const taxonomyId = getTaxonomyId(listingData.category);
    const tags = generateTags(listingData);

    const listingPayload = {
      quantity: listingData.quantity || 1,
      title: listingData.title.substring(0, 140), // Etsy max title length
      description: listingData.description,
      price: listingData.price,
      who_made: 'someone_else', // Options: i_did, someone_else, collective
      when_made: '2020_2024', // When the item was made
      taxonomy_id: taxonomyId,
      shipping_profile_id: shippingProfileId,
      tags: tags,
      is_supply: false, // false for finished items, true for craft supplies
      state: 'draft', // Start as draft, publish later
      item_weight: null, // Optional: weight in ounces
      item_weight_unit: 'oz',
      item_dimensions_unit: 'in',
    };

    const response = await makeEtsyRequest(
      accessToken,
      `/application/shops/${shopId}/listings`,
      'POST',
      listingPayload
    );

    logger.info(`Created Etsy draft listing: ${response.listing_id}`);
    return { success: true, listingId: response.listing_id };
  } catch (error: any) {
    logger.error('Etsy createDraftListing error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create draft listing',
    };
  }
};

/**
 * Publish a draft listing
 */
export const publishListing = async (
  accessToken: string,
  shopId: number,
  listingId: number
): Promise<{ success: boolean; listingUrl?: string; error?: string }> => {
  try {
    // Update listing state to active
    const response = await makeEtsyRequest(
      accessToken,
      `/application/shops/${shopId}/listings/${listingId}`,
      'PUT',
      { state: 'active' }
    );

    const listingUrl = response.url || `https://www.etsy.com/listing/${listingId}`;

    logger.info(`Published Etsy listing: ${listingId}`);
    return { success: true, listingUrl };
  } catch (error: any) {
    logger.error('Etsy publishListing error:', error);
    return {
      success: false,
      error: error.message || 'Failed to publish listing',
    };
  }
};

/**
 * Full flow: Create draft listing, upload images, and publish
 */
export const createAndPublishListing = async (
  accessToken: string,
  listingData: ListingData
): Promise<EtsyListingResult> => {
  try {
    // Step 1: Get shop info
    const shopInfo = await getShopInfo(accessToken);
    if (!shopInfo) {
      return { success: false, error: 'Failed to get shop information' };
    }

    // Step 2: Create draft listing
    const draftResult = await createDraftListing(accessToken, shopInfo.shop_id, listingData);
    if (!draftResult.success || !draftResult.listingId) {
      return { success: false, error: draftResult.error };
    }

    const listingId = draftResult.listingId;

    // Step 3: Upload images
    if (listingData.photos && listingData.photos.length > 0) {
      for (let i = 0; i < Math.min(listingData.photos.length, 10); i++) {
        await uploadListingImage(
          accessToken,
          shopInfo.shop_id,
          listingId,
          listingData.photos[i],
          i + 1
        );
      }
    }

    // Step 4: Publish listing
    const publishResult = await publishListing(accessToken, shopInfo.shop_id, listingId);
    if (!publishResult.success) {
      return { success: false, error: publishResult.error };
    }

    return {
      success: true,
      listingId: listingId.toString(),
      listingUrl: publishResult.listingUrl,
    };
  } catch (error: any) {
    logger.error('Etsy createAndPublishListing error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create and publish listing',
    };
  }
};

/**
 * Get OAuth URL for Etsy authentication
 */
export const getOAuthUrl = (state: string): string => {
  const clientId = process.env.ETSY_API_KEY;
  const redirectUri = process.env.ETSY_REDIRECT_URI || 'https://quicksell.monster/api/v1/marketplaces/etsy/callback';

  // Etsy OAuth scopes
  const scopes = [
    'listings_w', // Write access to listings
    'shops_r',    // Read access to shops
    'profile_r',  // Read access to profile
  ].join('%20');

  const codeChallenge = state; // In production, use PKCE properly

  return `https://www.etsy.com/oauth/connect?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
};

/**
 * Exchange authorization code for access token
 */
export const exchangeCodeForToken = async (
  code: string,
  codeVerifier: string
): Promise<{
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  error?: string;
}> => {
  try {
    const clientId = process.env.ETSY_API_KEY;
    const redirectUri = process.env.ETSY_REDIRECT_URI || 'https://quicksell.monster/api/v1/marketplaces/etsy/callback';

    const response = await fetch('https://api.etsy.com/v3/public/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId || '',
        redirect_uri: redirectUri,
        code: code,
        code_verifier: codeVerifier,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error_description || 'Token exchange failed');
    }

    const data = await response.json();

    return {
      success: true,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  } catch (error: any) {
    logger.error('Etsy token exchange error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (
  refreshToken: string
): Promise<{
  success: boolean;
  accessToken?: string;
  expiresIn?: number;
  error?: string;
}> => {
  try {
    const clientId = process.env.ETSY_API_KEY;

    const response = await fetch('https://api.etsy.com/v3/public/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: clientId || '',
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();

    return {
      success: true,
      accessToken: data.access_token,
      expiresIn: data.expires_in,
    };
  } catch (error: any) {
    logger.error('Etsy token refresh error:', error);
    return { success: false, error: error.message };
  }
};

export default {
  createAndPublishListing,
  createDraftListing,
  publishListing,
  getShopInfo,
  getOAuthUrl,
  exchangeCodeForToken,
  refreshAccessToken,
};
