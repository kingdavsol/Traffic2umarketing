/**
 * Assisted Posting Service
 * Generates pre-filled URLs for marketplaces that don't have APIs
 * Users can open these URLs and just click "Submit"
 */

import { logger } from '../config/logger';

interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  condition?: string;
  brand?: string;
  model?: string;
  color?: string;
  size?: string;
  photos?: string[];
  fulfillment_type?: string;
}

interface AssistedPostingUrl {
  marketplace: string;
  url: string;
  instructions: string;
  requiresPhotos: boolean;
  photoCount?: number;
}

/**
 * Generate Craigslist posting URL
 * Craigslist doesn't support URL parameters, so we'll open the category page
 */
function generateCraigslistUrl(listing: Listing): AssistedPostingUrl {
  // Map categories to Craigslist categories
  const categoryMap: Record<string, string> = {
    'Electronics': 'ela',
    'Clothing': 'cla',
    'Furniture': 'fua',
    'Toys': 'taa',
    'Sports': 'sga',
    'Books': 'bka',
    'Home & Garden': 'hsa',
    'default': 'sss', // for sale by owner
  };

  const category = categoryMap[listing.category] || categoryMap.default;
  const baseUrl = 'https://post.craigslist.org/c/sfo'; // San Francisco as default

  return {
    marketplace: 'Craigslist',
    url: `${baseUrl}?catAbb=${category}`,
    instructions: `1. Login if needed\n2. Copy listing details from QuickSell\n3. Paste and upload ${listing.photos?.length || 0} photos\n4. Click "Publish"`,
    requiresPhotos: true,
    photoCount: listing.photos?.length || 0,
  };
}

/**
 * Generate Facebook Marketplace URL
 * Opens the create listing page
 */
function generateFacebookUrl(listing: Listing): AssistedPostingUrl {
  // Facebook uses a form that can't be pre-filled via URL
  // We'll open the create listing page
  const baseUrl = 'https://www.facebook.com/marketplace/create/item';

  return {
    marketplace: 'Facebook Marketplace',
    url: baseUrl,
    instructions: `1. Copy: ${listing.title}\n2. Copy: $${listing.price}\n3. Copy description from QuickSell\n4. Upload ${listing.photos?.length || 0} photos\n5. Click "Next" and "Publish"`,
    requiresPhotos: true,
    photoCount: listing.photos?.length || 0,
  };
}

/**
 * Generate OfferUp URL
 * OfferUp uses app-based posting primarily
 */
function generateOfferUpUrl(listing: Listing): AssistedPostingUrl {
  const baseUrl = 'https://offerup.com/sell/';

  return {
    marketplace: 'OfferUp',
    url: baseUrl,
    instructions: `1. Click "Create a listing"\n2. Upload ${listing.photos?.length || 0} photos\n3. Copy title and price from QuickSell\n4. Paste description\n5. Click "Post"`,
    requiresPhotos: true,
    photoCount: listing.photos?.length || 0,
  };
}

/**
 * Generate Mercari URL
 * Mercari requires app but has web interface
 */
function generateMercariUrl(listing: Listing): AssistedPostingUrl {
  const baseUrl = 'https://www.mercari.com/sell/';

  return {
    marketplace: 'Mercari',
    url: baseUrl,
    instructions: `1. Click "List an item"\n2. Upload ${listing.photos?.length || 0} photos\n3. Copy title: ${listing.title}\n4. Copy price: $${listing.price}\n5. Paste description\n6. Click "List"`,
    requiresPhotos: true,
    photoCount: listing.photos?.length || 0,
  };
}

/**
 * Generate Poshmark URL
 * Poshmark has a web interface for listing
 */
function generatePoshmarkUrl(listing: Listing): AssistedPostingUrl {
  const baseUrl = 'https://poshmark.com/create-listing';

  return {
    marketplace: 'Poshmark',
    url: baseUrl,
    instructions: `1. Upload cover photo\n2. Upload ${(listing.photos?.length || 1) - 1} additional photos\n3. Copy title from QuickSell\n4. Select category\n5. Copy price: $${listing.price}\n6. Paste description\n7. Click "List"`,
    requiresPhotos: true,
    photoCount: listing.photos?.length || 0,
  };
}

/**
 * Generate Depop URL
 * Depop is primarily mobile but has web interface
 */
function generateDepopUrl(listing: Listing): AssistedPostingUrl {
  const baseUrl = 'https://www.depop.com/products/create/';

  return {
    marketplace: 'Depop',
    url: baseUrl,
    instructions: `1. Upload ${listing.photos?.length || 0} photos\n2. Copy title from QuickSell (max 60 chars)\n3. Copy description\n4. Enter price: $${listing.price}\n5. Select category and size\n6. Click "List item"`,
    requiresPhotos: true,
    photoCount: listing.photos?.length || 0,
  };
}

/**
 * Generate Vinted URL
 * Vinted has web interface for selling
 */
function generateVintedUrl(listing: Listing): AssistedPostingUrl {
  const baseUrl = 'https://www.vinted.com/items/new';

  return {
    marketplace: 'Vinted',
    url: baseUrl,
    instructions: `1. Upload ${listing.photos?.length || 0} photos\n2. Copy title from QuickSell\n3. Select category\n4. Enter price: $${listing.price}\n5. Paste description\n6. Click "Upload item"`,
    requiresPhotos: true,
    photoCount: listing.photos?.length || 0,
  };
}

/**
 * Generate Etsy listing URL (for handmade/vintage items)
 */
function generateEtsyUrl(listing: Listing): AssistedPostingUrl {
  const baseUrl = 'https://www.etsy.com/your/shops/me/tools/listings/new';

  return {
    marketplace: 'Etsy',
    url: baseUrl,
    instructions: `1. Upload ${listing.photos?.length || 0} photos\n2. Copy title from QuickSell\n3. Select category\n4. Copy description\n5. Enter price: $${listing.price}\n6. Set quantity and shipping\n7. Click "Publish"`,
    requiresPhotos: true,
    photoCount: listing.photos?.length || 0,
  };
}

/**
 * Main function to generate all assisted posting URLs
 */
export async function generateAssistedPostingUrls(
  listing: Listing,
  marketplaces: string[]
): Promise<AssistedPostingUrl[]> {
  const urls: AssistedPostingUrl[] = [];

  try {
    for (const marketplace of marketplaces) {
      let postingUrl: AssistedPostingUrl;

      switch (marketplace.toLowerCase()) {
        case 'craigslist':
          postingUrl = generateCraigslistUrl(listing);
          break;

        case 'facebook':
        case 'facebook marketplace':
          postingUrl = generateFacebookUrl(listing);
          break;

        case 'offerup':
          postingUrl = generateOfferUpUrl(listing);
          break;

        case 'mercari':
          postingUrl = generateMercariUrl(listing);
          break;

        case 'poshmark':
          postingUrl = generatePoshmarkUrl(listing);
          break;

        case 'depop':
          postingUrl = generateDepopUrl(listing);
          break;

        case 'vinted':
          postingUrl = generateVintedUrl(listing);
          break;

        case 'etsy':
          postingUrl = generateEtsyUrl(listing);
          break;

        default:
          logger.warn(`Unknown marketplace for assisted posting: ${marketplace}`);
          continue;
      }

      urls.push(postingUrl);
    }

    logger.info(`Generated ${urls.length} assisted posting URLs for listing ${listing.id}`);
    return urls;
  } catch (error) {
    logger.error('Error generating assisted posting URLs:', error);
    throw error;
  }
}

/**
 * Get copy-paste template for a marketplace
 * This provides the formatted text users should copy
 */
export function getCopyPasteTemplate(listing: Listing, marketplace: string): string {
  const template = [];

  // Title
  template.push(`TITLE:\n${listing.title}\n`);

  // Price
  template.push(`PRICE:\n$${listing.price}\n`);

  // Description
  template.push(`DESCRIPTION:\n${listing.description}\n`);

  // Details
  if (listing.condition || listing.brand || listing.model) {
    template.push(`DETAILS:`);
    if (listing.condition) template.push(`Condition: ${listing.condition}`);
    if (listing.brand) template.push(`Brand: ${listing.brand}`);
    if (listing.model) template.push(`Model: ${listing.model}`);
    if (listing.color) template.push(`Color: ${listing.color}`);
    if (listing.size) template.push(`Size: ${listing.size}`);
    template.push('');
  }

  // Category
  template.push(`CATEGORY:\n${listing.category}\n`);

  // Photos
  if (listing.photos && listing.photos.length > 0) {
    template.push(`PHOTOS:\n${listing.photos.length} photos ready to upload\n`);
  }

  return template.join('\n');
}

export default {
  generateAssistedPostingUrls,
  getCopyPasteTemplate,
};
