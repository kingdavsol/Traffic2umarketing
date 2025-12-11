import { query } from '../database/connection';
import { logger } from '../config/logger';
import { createAndPublishListing as publishToEbay } from '../integrations/ebay';

interface Listing {
  id: number;
  user_id: number;
  title: string;
  description: string;
  price: number;
  category?: string;
  condition?: string;
  brand?: string;
  model?: string;
  color?: string;
  size?: string;
  fulfillment_type: string;
  photos: any;
}

interface MarketplaceResult {
  marketplace: string;
  success: boolean;
  listingId?: string;
  listingUrl?: string;
  error?: string;
  copyPasteData?: any;
}

/**
 * Get user's marketplace accounts
 */
export const getUserMarketplaceAccounts = async (userId: number) => {
  const result = await query(
    'SELECT * FROM marketplace_accounts WHERE user_id = $1 AND is_active = true',
    [userId]
  );
  return result.rows;
};

/**
 * Publish listing to eBay
 */
const publishToEbayMarketplace = async (
  listing: Listing,
  accessToken: string
): Promise<MarketplaceResult> => {
  try {
    const result = await publishToEbay(
      accessToken,
      {
        title: listing.title,
        description: listing.description,
        price: listing.price,
        category: listing.category || 'Other',
        condition: listing.condition || 'Used',
        brand: listing.brand,
        photos: Array.isArray(listing.photos) ? listing.photos : JSON.parse(listing.photos || '[]'),
        fulfillmentType: listing.fulfillment_type as any,
        sku: `QS-${listing.id}-${Date.now()}`,
      },
      {
        merchantLocationKey: 'default',
        fulfillmentPolicyId: 'default',
        paymentPolicyId: 'default',
        returnPolicyId: 'default',
      }
    );

    if (result.success) {
      return {
        marketplace: 'ebay',
        success: true,
        listingId: result.listingId,
        listingUrl: result.listingUrl || `https://www.ebay.com/itm/${result.listingId}`,
      };
    } else {
      return {
        marketplace: 'ebay',
        success: false,
        error: result.error,
      };
    }
  } catch (error: any) {
    logger.error('eBay publish error:', error);
    return {
      marketplace: 'ebay',
      success: false,
      error: error.message || 'Failed to publish to eBay',
    };
  }
};

/**
 * Generate copy/paste data for manual marketplaces
 */
const generateCopyPasteData = (listing: Listing, marketplace: string): MarketplaceResult => {
  const photos = Array.isArray(listing.photos) ? listing.photos : JSON.parse(listing.photos || '[]');

  const templates: Record<string, any> = {
    facebook: {
      title: listing.title,
      description: `${listing.description}\n\nPrice: $${listing.price}\n${listing.condition ? `Condition: ${listing.condition}` : ''}${listing.brand ? `\nBrand: ${listing.brand}` : ''}`,
      price: listing.price,
      photos: photos,
      instructions: [
        '1. Go to Facebook Marketplace',
        '2. Click "Create new listing"',
        '3. Copy the title above',
        '4. Copy the description above',
        '5. Set the price',
        '6. Upload the photos',
        '7. Click "Publish"'
      ]
    },
    craigslist: {
      title: listing.title,
      description: `${listing.description}\n\nPrice: $${listing.price}\n${listing.condition ? `Condition: ${listing.condition}` : ''}${listing.brand ? `\nBrand: ${listing.brand}` : ''}`,
      price: listing.price,
      photos: photos,
      instructions: [
        '1. Go to Craigslist for your city',
        '2. Click "post to classifieds"',
        '3. Select appropriate category',
        '4. Copy the title above',
        '5. Copy the description above',
        '6. Set the price',
        '7. Upload up to 24 photos',
        '8. Review and publish'
      ]
    },
    offerup: {
      title: listing.title,
      description: listing.description,
      price: listing.price,
      photos: photos,
      instructions: [
        '1. Open OfferUp app or website',
        '2. Tap "Sell"',
        '3. Copy title and description',
        '4. Set price and upload photos',
        '5. Publish listing'
      ]
    },
    mercari: {
      title: listing.title,
      description: listing.description,
      price: listing.price,
      photos: photos,
      instructions: [
        '1. Open Mercari app',
        '2. Tap "Sell"',
        '3. Upload photos',
        '4. Copy title and description',
        '5. Set price and shipping',
        '6. List item'
      ]
    }
  };

  const template = templates[marketplace.toLowerCase()] || {
    title: listing.title,
    description: listing.description,
    price: listing.price,
    photos: photos,
    instructions: ['Copy the information above and paste it into the marketplace']
  };

  return {
    marketplace,
    success: true,
    copyPasteData: template
  };
};

/**
 * Publish listing to multiple marketplaces
 */
export const publishListingToMarketplaces = async (
  listingId: number,
  userId: number,
  selectedMarketplaces: string[]
): Promise<MarketplaceResult[]> => {
  try {
    // Get the listing
    const listingResult = await query(
      'SELECT * FROM listings WHERE id = $1 AND user_id = $2',
      [listingId, userId]
    );

    if (listingResult.rows.length === 0) {
      throw new Error('Listing not found');
    }

    const listing: Listing = listingResult.rows[0];

    // Get user's marketplace accounts
    const accounts = await getUserMarketplaceAccounts(userId);
    const accountMap = new Map(accounts.map((acc: any) => [acc.marketplace_name.toLowerCase(), acc]));

    const results: MarketplaceResult[] = [];

    // Process each selected marketplace
    for (const marketplace of selectedMarketplaces) {
      const marketplaceLower = marketplace.toLowerCase();
      const account = accountMap.get(marketplaceLower);

      // Automatic posting for eBay if credentials exist
      if (marketplaceLower === 'ebay' && account?.access_token) {
        const result = await publishToEbayMarketplace(listing, account.access_token);
        results.push(result);

        // Save result to database
        if (result.success) {
          await query(
            `UPDATE listings
             SET marketplace_listings = marketplace_listings || $1::jsonb
             WHERE id = $2`,
            [JSON.stringify({ [marketplace]: { listingId: result.listingId, url: result.listingUrl } }), listingId]
          );
        }
      }
      // Automatic posting for Craigslist if credentials exist
      // Note: Craigslist doesn't have an official API, so this would be copy/paste
      else if (marketplaceLower === 'craigslist') {
        const result = generateCopyPasteData(listing, marketplace);
        results.push(result);
      }
      // Copy/paste for all other marketplaces
      else {
        const result = generateCopyPasteData(listing, marketplace);
        results.push(result);
      }
    }

    // Update listing status to published if at least one succeeded
    const hasSuccess = results.some(r => r.success);
    if (hasSuccess) {
      await query(
        'UPDATE listings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['published', listingId]
      );
    }

    return results;
  } catch (error: any) {
    logger.error('Publish to marketplaces error:', error);
    throw error;
  }
};

/**
 * Get user's connected marketplaces
 */
export const getConnectedMarketplaces = async (userId: number) => {
  const accounts = await getUserMarketplaceAccounts(userId);
  return accounts.map((acc: any) => ({
    marketplace: acc.marketplace_name,
    accountName: acc.account_name,
    isActive: acc.is_active,
    autoSyncEnabled: acc.auto_sync_enabled,
    lastSync: acc.last_sync_at
  }));
};
