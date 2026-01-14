/**
 * Marketplace Automation Service
 * Orchestrates automated posting to multiple marketplaces with watermarking
 */

import { logger } from '../config/logger';
import { pool } from '../database/connection';
import watermarkService from './watermarkService';
import craigslistIntegration from '../integrations/craigslist';
import ebayIntegration from '../integrations/ebay';
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
      // Get Craigslist credentials
      const credentials = await bulkMarketplaceSignupService.getMarketplaceCredentials(
        userId,
        'Craigslist'
      );

      if (!credentials) {
        return {
          marketplace: 'Craigslist',
          success: false,
          error: 'Craigslist account not connected. Please connect your account first.',
        };
      }

      // Check if automation is available
      const available = await craigslistIntegration.isAvailable();
      if (!available) {
        return {
          marketplace: 'Craigslist',
          success: false,
          error: 'Craigslist automation currently unavailable. Use manual posting.',
        };
      }

      // Post to Craigslist
      const result = await craigslistIntegration.postToCraigslist(
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
      );

      if (result.success) {
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
        return {
          marketplace: 'Craigslist',
          success: false,
          error: result.error || 'Failed to post to Craigslist',
        };
      }
    } catch (error: any) {
      logger.error('Craigslist publish error:', error);
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
   * Note: OfferUp has no public API, this returns manual posting instructions
   */
  private async publishToOfferUp(
    userId: number,
    listing: Listing,
    photos: string[],
    description: string
  ): Promise<PublishResult> {
    // OfferUp has no public API - provide copy/paste data
    return {
      marketplace: 'OfferUp',
      success: false,
      error: 'OfferUp does not have a public API. Use the copy buttons to manually post your listing.',
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
   * Note: Nextdoor has no public API
   */
  private async publishToNextdoor(
    userId: number,
    listing: Listing,
    photos: string[],
    description: string
  ): Promise<PublishResult> {
    // Nextdoor has no public API - provide copy/paste data
    return {
      marketplace: 'Nextdoor',
      success: false,
      error: 'Nextdoor does not have a public API. Use the copy buttons to manually post your listing.',
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
   * Note: Poshmark API integration pending
   */
  private async publishToPoshmark(
    userId: number,
    listing: Listing,
    photos: string[],
    description: string
  ): Promise<PublishResult> {
    // Poshmark API integration pending - provide copy/paste data for now
    return {
      marketplace: 'Poshmark',
      success: false,
      error: 'Poshmark API integration coming soon. Use the copy buttons to manually post your listing.',
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
