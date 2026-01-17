/**
 * Marketplace Automation Service
 * Orchestrates automated posting to multiple marketplaces with watermarking
 */

import { logger } from '../config/logger';
import { pool } from '../database/connection';
import watermarkService from './watermarkService';
import craigslistIntegration from '../integrations/craigslist';
import poshmarkIntegration from '../integrations/poshmark';
import ebayIntegration from '../integrations/ebay';
import offerupIntegration from '../integrations/offerup';
import nextdoorIntegration from '../integrations/nextdoor';
import bulkMarketplaceSignupService from './bulkMarketplaceSignupService';

interface Listing {
  id: number;
  user_id: number;
  title: string;
  description: string;
  category: string;
  price: string;
  condition: string;
  brand?: string;
  model?: string;
  color?: string;
  size?: string;
  fulfillment_type: string;
  photos: string[];
  marketplace_listings?: any;
}

interface PublishResult {
  marketplace: string;
  success: boolean;
  listingId?: string;
  url?: string;
  error?: string;
  requiresVerification?: boolean;
  copyPasteData?: {
    title: string;
    description: string;
    price: string;
    category?: string;
    condition?: string;
  };
}

interface PublishOptions {
  city?: string;
  zipcode?: string;
  skipWatermark?: boolean;
}

/**
 * Timeout wrapper for promises - prevents indefinite hanging
 */
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    )
  ]);
};

class MarketplaceAutomationService {
  /**
   * Publish a listing to multiple marketplaces
   */
  async publishToMarketplaces(
    listingId: number,
    userId: number,
    marketplaces: string[],
    options: PublishOptions = {}
  ): Promise<{ results: PublishResult[]; overallSuccess: boolean }> {
    try {
      // Get the listing
      const listingResult = await pool.query(
        'SELECT * FROM listings WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
        [listingId, userId]
      );

      if (listingResult.rows.length === 0) {
        throw new Error('Listing not found');
      }

      const listing: Listing = listingResult.rows[0];

      // Add watermarks to photos and description unless skipped
      let watermarkedPhotos = listing.photos || [];
      let watermarkedDescription = listing.description;

      if (!options.skipWatermark) {
        logger.info(`Adding watermarks to listing ${listingId}`);
        watermarkedPhotos = await watermarkService.addWatermarkToPhotos(listing.photos || []);
        watermarkedDescription = watermarkService.addWatermarkToDescription(listing.description);
      }

      // Publish to each marketplace
      const results: PublishResult[] = [];

      for (const marketplace of marketplaces) {
        const marketplaceLower = marketplace.toLowerCase();

        try {
          let result: PublishResult;

          switch (marketplaceLower) {
            case 'craigslist':
              result = await this.publishToCraigslist(
                userId,
                listing,
                watermarkedPhotos,
                watermarkedDescription,
                options
              );
              break;

            case 'ebay':
              result = await this.publishToEbay(
                userId,
                listing,
                watermarkedPhotos,
                watermarkedDescription
              );
              break;

            case 'offerup':
              result = await this.publishToOfferUp(
                userId,
                listing,
                watermarkedPhotos,
                watermarkedDescription
              );
              break;

            case 'facebook':
              result = await this.publishToFacebook(
                userId,
                listing,
                watermarkedPhotos,
                watermarkedDescription
              );
              break;

            case 'mercari':
              result = await this.publishToMercari(
                userId,
                listing,
                watermarkedPhotos,
                watermarkedDescription
              );
              break;

            case 'nextdoor':
              result = await this.publishToNextdoor(
                userId,
                listing,
                watermarkedPhotos,
                watermarkedDescription
              );
              break;

            case 'tiktok':
            case 'tiktokshop':
              result = await this.publishToTikTokShop(
                userId,
                listing,
                watermarkedPhotos,
                watermarkedDescription
              );
              break;

            case 'poshmark':
              result = await this.publishToPoshmark(
                userId,
                listing,
                watermarkedPhotos,
                watermarkedDescription
              );
              break;

            case 'instagram':
            case 'instagramshopping':
              result = await this.publishToInstagram(
                userId,
                listing,
                watermarkedPhotos,
                watermarkedDescription
              );
              break;

            default:
              result = {
                marketplace,
                success: false,
                error: `Marketplace ${marketplace} not supported`,
              };
          }

          results.push(result);

          // Update listing with marketplace posting result
          if (result.success) {
            await this.updateMarketplaceStatus(
              listingId,
              marketplace,
              result.listingId,
              result.url,
              result.requiresVerification
            );
          }
        } catch (error: any) {
          logger.error(`Error publishing to ${marketplace}:`, error);
          results.push({
            marketplace,
            success: false,
            error: error.message || 'Unknown error',
          });
        }
      }

      const overallSuccess = results.some((r) => r.success);

      // Update listing status
      if (overallSuccess) {
        await pool.query(
          'UPDATE listings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          ['published', listingId]
        );
      }

      logger.info(
        `Published listing ${listingId} to ${results.filter((r) => r.success).length}/${marketplaces.length} marketplaces`
      );

      return { results, overallSuccess };
    } catch (error: any) {
      logger.error('Marketplace automation error:', error);
      throw error;
    }
  }

  /**
   * Publish to Craigslist
   */
  private async publishToCraigslist(
    userId: number,
    listing: Listing,
    photos: string[],
    description: string,
    options: PublishOptions
  ): Promise<PublishResult> {
    try {
      logger.info(`[Craigslist] Starting publish for user ${userId}, listing ${listing.id}`);

      // Get Craigslist credentials
      const credentials = await bulkMarketplaceSignupService.getMarketplaceCredentials(
        userId,
        'Craigslist'
      );

      if (!credentials) {
        logger.warn(`[Craigslist] No credentials found for user ${userId}`);
        return {
          marketplace: 'Craigslist',
          success: false,
          error: 'Craigslist account not connected. Please connect your account first.',
        };
      }

      logger.info(`[Craigslist] Found credentials for ${credentials.email}`);

      // Check if automation is available
      const available = await craigslistIntegration.isAvailable();
      if (!available) {
        logger.error(`[Craigslist] Browser automation not available`);
        return {
          marketplace: 'Craigslist',
          success: false,
          error: 'Craigslist automation currently unavailable. Use manual posting.',
        };
      }

      logger.info(`[Craigslist] Browser automation available, starting post...`);

      // Post to Craigslist with 60-second timeout for entire operation
      const result = await withTimeout(
        craigslistIntegration.postToCraigslist(
          {
            email: credentials.email,
            password: credentials.password,
          },
          {
            title: listing.title,
            description: description,
            price: parseFloat(listing.price),
            category: listing.category,
            photos: photos,
            location: {
              city: options.city || 'san francisco',
              zipcode: options.zipcode,
            },
          }
        ),
        60000,
        'Craigslist posting timeout - operation took longer than 60 seconds'
      );

      if (result.success) {
        logger.info(`[Craigslist] Successfully posted listing ${listing.id}. Requires verification: ${result.requiresVerification}`);
        return {
          marketplace: 'Craigslist',
          success: true,
          listingId: result.postingId,
          url: result.postingId
            ? `https://craigslist.org/${result.postingId}.html`
            : undefined,
          requiresVerification: result.requiresVerification,
        };
      } else {
        logger.error(`[Craigslist] Failed to post listing ${listing.id}: ${result.error}`);
        return {
          marketplace: 'Craigslist',
          success: false,
          error: result.error || 'Failed to post to Craigslist',
        };
      }
    } catch (error: any) {
      logger.error(`[Craigslist] Exception during publish for listing ${listing.id}:`, error);
      return {
        marketplace: 'Craigslist',
        success: false,
        error: error.message || 'Craigslist posting failed',
      };
    }
  }

  /**
   * Publish to eBay
   */
  private async publishToEbay(
    userId: number,
    listing: Listing,
    photos: string[],
    description: string
  ): Promise<PublishResult> {
    try {
      // Get eBay access token
      const tokenResult = await pool.query(
        `SELECT access_token, refresh_token, token_expires_at
         FROM marketplace_accounts
         WHERE user_id = $1 AND marketplace_name = 'eBay' AND is_active = true`,
        [userId]
      );

      if (tokenResult.rows.length === 0) {
        return {
          marketplace: 'eBay',
          success: false,
          error: 'eBay account not connected. Please connect your eBay account first.',
        };
      }

      const { access_token } = tokenResult.rows[0];

      // Get eBay seller policies
      const policiesResult = await pool.query(
        `SELECT policies FROM marketplace_accounts
         WHERE user_id = $1 AND marketplace_name = 'eBay' AND is_active = true`,
        [userId]
      );

      if (!policiesResult.rows[0]?.policies) {
        return {
          marketplace: 'eBay',
          success: false,
          error: 'eBay seller policies not configured. Please set up your eBay seller account.',
        };
      }

      const policies = policiesResult.rows[0].policies;

      // Publish to eBay
      const result = await ebayIntegration.createAndPublishListing(
        access_token,
        {
          title: listing.title,
          description: description,
          price: parseFloat(listing.price),
          category: listing.category,
          condition: listing.condition || 'used',
          brand: listing.brand,
          photos: photos,
          fulfillmentType: listing.fulfillment_type as any,
        },
        policies
      );

      if (result.success) {
        return {
          marketplace: 'eBay',
          success: true,
          listingId: result.listingId,
          url: `https://www.ebay.com/itm/${result.listingId}`,
        };
      } else {
        return {
          marketplace: 'eBay',
          success: false,
          error: result.error || 'Failed to publish to eBay',
        };
      }
    } catch (error: any) {
      logger.error('eBay publish error:', error);
      return {
        marketplace: 'eBay',
        success: false,
        error: error.message || 'eBay posting failed',
      };
    }
  }

  /**
   * Publish to OfferUp
   * Uses browser automation (similar to Craigslist)
   */
  private async publishToOfferUp(
    userId: number,
    listing: Listing,
    photos: string[],
    description: string
  ): Promise<PublishResult> {
    try {
      logger.info(`[OfferUp] Starting publish for user ${userId}, listing ${listing.id}`);

      // Get OfferUp credentials (match database casing)
      const credentials = await bulkMarketplaceSignupService.getMarketplaceCredentials(
        userId,
        'Offerup'
      );

      if (!credentials) {
        logger.warn(`[OfferUp] No credentials found for user ${userId}`);
        return {
          marketplace: 'OfferUp',
          success: false,
          error: 'OfferUp account not connected. Please connect your account first.',
          copyPasteData: {
            title: listing.title,
            description: description,
            price: listing.price,
            category: listing.category,
            condition: listing.condition,
          },
        };
      }

      logger.info(`[OfferUp] Found credentials for ${credentials.email}`);

      // Check if automation is available
      const available = await offerupIntegration.isAvailable();
      if (!available) {
        logger.error(`[OfferUp] Browser automation not available`);
        return {
          marketplace: 'OfferUp',
          success: false,
          error: 'OfferUp automation currently unavailable. Use manual posting.',
          copyPasteData: {
            title: listing.title,
            description: description,
            price: listing.price,
            category: listing.category,
            condition: listing.condition,
          },
        };
      }

      logger.info(`[OfferUp] Browser automation available, starting post...`);

      // Post to OfferUp with 60-second timeout for entire operation
      const result = await withTimeout(
        offerupIntegration.postToOfferUp(
          {
            email: credentials.email,
            password: credentials.password,
          },
          {
            title: listing.title,
            description: description,
            price: parseFloat(listing.price),
            category: listing.category,
            condition: listing.condition,
            photos: photos,
            location: {
              city: 'San Francisco', // Default, could be made configurable
              zipcode: undefined, // Could be made configurable
            },
          }
        ),
        60000,
        'OfferUp posting timeout - operation took longer than 60 seconds'
      );

      if (result.success) {
        logger.info(`[OfferUp] Successfully posted listing ${listing.id}`);
        return {
          marketplace: 'OfferUp',
          success: true,
          listingId: result.postingId,
          url: result.postingUrl,
        };
      } else {
        logger.error(`[OfferUp] Failed to post listing ${listing.id}: ${result.error}`);
        return {
          marketplace: 'OfferUp',
          success: false,
          error: result.error || 'Failed to post to OfferUp',
          copyPasteData: {
            title: listing.title,
            description: description,
            price: listing.price,
            category: listing.category,
            condition: listing.condition,
          },
        };
      }
    } catch (error: any) {
      logger.error(`[OfferUp] Exception during publish for listing ${listing.id}:`, error);
      return {
        marketplace: 'OfferUp',
        success: false,
        error: error.message || 'OfferUp posting failed',
        copyPasteData: {
          title: listing.title,
          description: description,
          price: listing.price,
          category: listing.category,
          condition: listing.condition,
        },
      };
    }
  }

  /**
   * Publish to Facebook Marketplace
   * Note: Facebook Marketplace API requires business verification
   */
  private async publishToFacebook(
    userId: number,
    listing: Listing,
    photos: string[],
    description: string
  ): Promise<PublishResult> {
    // Facebook Marketplace requires business verification and Graph API access
    return {
      marketplace: 'Facebook',
      success: false,
      error: 'Facebook Marketplace automation requires business verification. Use copy buttons to post manually.',
      copyPasteData: {
        title: listing.title,
        description: description,
        price: listing.price,
        category: listing.category,
        condition: listing.condition,
      },
    };
  }

  /**
   * Publish to Mercari
   * Note: Mercari has no public API
   */
  private async publishToMercari(
    userId: number,
    listing: Listing,
    photos: string[],
    description: string
  ): Promise<PublishResult> {
    // Mercari has no public API - provide copy/paste data
    return {
      marketplace: 'Mercari',
      success: false,
      error: 'Mercari does not have a public API. Use the copy buttons to manually post your listing.',
      copyPasteData: {
        title: listing.title,
        description: description,
        price: listing.price,
        category: listing.category,
        condition: listing.condition,
      },
    };
  }

  /**
   * Publish to Nextdoor
   * Uses browser automation (similar to Craigslist)
   */
  private async publishToNextdoor(
    userId: number,
    listing: Listing,
    photos: string[],
    description: string
  ): Promise<PublishResult> {
    try {
      logger.info(`[Nextdoor] Starting publish for user ${userId}, listing ${listing.id}`);

      // Get Nextdoor credentials
      const credentials = await bulkMarketplaceSignupService.getMarketplaceCredentials(
        userId,
        'Nextdoor'
      );

      if (!credentials) {
        logger.warn(`[Nextdoor] No credentials found for user ${userId}`);
        return {
          marketplace: 'Nextdoor',
          success: false,
          error: 'Nextdoor account not connected. Please connect your account first.',
          copyPasteData: {
            title: listing.title,
            description: description,
            price: listing.price,
            category: listing.category,
            condition: listing.condition,
          },
        };
      }

      logger.info(`[Nextdoor] Found credentials for ${credentials.email}`);

      // Check if automation is available
      const available = await nextdoorIntegration.isAvailable();
      if (!available) {
        logger.error(`[Nextdoor] Browser automation not available`);
        return {
          marketplace: 'Nextdoor',
          success: false,
          error: 'Nextdoor automation currently unavailable. Use manual posting.',
          copyPasteData: {
            title: listing.title,
            description: description,
            price: listing.price,
            category: listing.category,
            condition: listing.condition,
          },
        };
      }

      logger.info(`[Nextdoor] Browser automation available, starting post...`);

      // Post to Nextdoor with 60-second timeout for entire operation
      const result = await withTimeout(
        nextdoorIntegration.postToNextdoor(
          {
            email: credentials.email,
            password: credentials.password,
          },
          {
            title: listing.title,
            description: description,
            price: parseFloat(listing.price),
            category: listing.category,
            condition: listing.condition,
            photos: photos,
          }
        ),
        60000,
        'Nextdoor posting timeout - operation took longer than 60 seconds'
      );

      if (result.success) {
        logger.info(`[Nextdoor] Successfully posted listing ${listing.id}`);
        return {
          marketplace: 'Nextdoor',
          success: true,
          listingId: result.postingId,
          url: result.postingUrl,
        };
      } else {
        logger.error(`[Nextdoor] Failed to post listing ${listing.id}: ${result.error}`);
        return {
          marketplace: 'Nextdoor',
          success: false,
          error: result.error || 'Failed to post to Nextdoor',
          copyPasteData: {
            title: listing.title,
            description: description,
            price: listing.price,
            category: listing.category,
            condition: listing.condition,
          },
        };
      }
    } catch (error: any) {
      logger.error(`[Nextdoor] Exception during publish for listing ${listing.id}:`, error);
      return {
        marketplace: 'Nextdoor',
        success: false,
        error: error.message || 'Nextdoor posting failed',
        copyPasteData: {
          title: listing.title,
          description: description,
          price: listing.price,
          category: listing.category,
          condition: listing.condition,
        },
      };
    }
  }

  /**
   * Publish to TikTok Shop
   * Note: TikTok Shop API requires seller approval
   */
  private async publishToTikTokShop(
    userId: number,
    listing: Listing,
    photos: string[],
    description: string
  ): Promise<PublishResult> {
    // TikTok Shop API requires seller onboarding - provide copy/paste data for now
    return {
      marketplace: 'TikTok Shop',
      success: false,
      error: 'TikTok Shop API requires seller approval. Use the copy buttons to manually post your listing.',
      copyPasteData: {
        title: listing.title,
        description: description,
        price: listing.price,
        category: listing.category,
        condition: listing.condition,
      },
    };
  }

  /**
   * Publish to Poshmark
   * Uses browser automation (similar to Craigslist)
   */
  private async publishToPoshmark(
    userId: number,
    listing: Listing,
    photos: string[],
    description: string
  ): Promise<PublishResult> {
    try {
      // Get Poshmark credentials
      const credentials = await bulkMarketplaceSignupService.getMarketplaceCredentials(
        userId,
        'Poshmark'
      );

      if (!credentials) {
        // No credentials - provide copy/paste data as fallback
        return {
          marketplace: 'Poshmark',
          success: false,
          error: 'Poshmark account not connected. Use the copy buttons to manually post, or connect your account for automated posting.',
          copyPasteData: {
            title: listing.title,
            description: description,
            price: listing.price,
            category: listing.category,
            condition: listing.condition,
          },
        };
      }

      // Check if automation is available
      const available = await poshmarkIntegration.isAvailable();
      if (!available) {
        return {
          marketplace: 'Poshmark',
          success: false,
          error: 'Poshmark automation currently unavailable. Use manual posting.',
          copyPasteData: {
            title: listing.title,
            description: description,
            price: listing.price,
            category: listing.category,
            condition: listing.condition,
          },
        };
      }

      // Post to Poshmark using browser automation with 60-second timeout
      const result = await withTimeout(
        poshmarkIntegration.postToPoshmark(
          {
            email: credentials.email,
            password: credentials.password,
          },
          {
            title: listing.title,
            description: description,
            price: parseFloat(listing.price),
            category: listing.category,
            brand: listing.brand,
            size: listing.size,
            condition: listing.condition,
            color: listing.color,
            photos: photos,
          }
        ),
        60000,
        'Poshmark posting timeout - operation took longer than 60 seconds'
      );

      if (result.success) {
        return {
          marketplace: 'Poshmark',
          success: true,
          listingId: result.postingId,
          url: result.url,
        };
      } else {
        // If automation fails, provide copy/paste data as fallback
        return {
          marketplace: 'Poshmark',
          success: false,
          error: result.error || 'Failed to post to Poshmark automatically. Use manual posting.',
          copyPasteData: {
            title: listing.title,
            description: description,
            price: listing.price,
            category: listing.category,
            condition: listing.condition,
          },
        };
      }
    } catch (error: any) {
      logger.error('Poshmark publish error:', error);
      return {
        marketplace: 'Poshmark',
        success: false,
        error: error.message || 'Poshmark posting failed',
        copyPasteData: {
          title: listing.title,
          description: description,
          price: listing.price,
          category: listing.category,
          condition: listing.condition,
        },
      };
    }
  }

  /**
   * Publish to Instagram Shopping
   * Note: Instagram Shopping API requires business account
   */
  private async publishToInstagram(
    userId: number,
    listing: Listing,
    photos: string[],
    description: string
  ): Promise<PublishResult> {
    // Instagram Shopping API requires business account - provide copy/paste data for now
    return {
      marketplace: 'Instagram Shopping',
      success: false,
      error: 'Instagram Shopping requires business account setup. Use the copy buttons to manually post your listing.',
      copyPasteData: {
        title: listing.title,
        description: description,
        price: listing.price,
        category: listing.category,
        condition: listing.condition,
      },
    };
  }

  /**
   * Update marketplace status in listings table
   */
  private async updateMarketplaceStatus(
    listingId: number,
    marketplace: string,
    listingIdOnMarketplace?: string,
    url?: string,
    requiresVerification?: boolean
  ): Promise<void> {
    try {
      // Get current marketplace_listings
      const result = await pool.query(
        'SELECT marketplace_listings FROM listings WHERE id = $1',
        [listingId]
      );

      const currentListings = result.rows[0]?.marketplace_listings || {};

      // Update with new marketplace data
      currentListings[marketplace] = {
        status: requiresVerification ? 'pending_verification' : 'posted',
        listingId: listingIdOnMarketplace,
        url: url,
        postedAt: new Date().toISOString(),
      };

      // Save back to database
      await pool.query(
        'UPDATE listings SET marketplace_listings = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [JSON.stringify(currentListings), listingId]
      );

      logger.info(`Updated marketplace status for listing ${listingId} on ${marketplace}`);
    } catch (error) {
      logger.error('Error updating marketplace status:', error);
    }
  }
}

export default new MarketplaceAutomationService();
