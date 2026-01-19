/**
 * Single source of truth for marketplace configurations
 * Used across MarketplaceSelector, MarketplaceSettings, and other components
 */

export interface MarketplaceConfig {
  id: string;
  name: string;
  description: string;
  requiresAuth: boolean;
  hasAPI: boolean;
  hasAutomation: boolean;
  url: string;
  category: 'local' | 'shipping' | 'both';
}

export const MARKETPLACE_CONFIGS: Record<string, MarketplaceConfig> = {
  tiktok: {
    id: 'tiktok',
    name: 'TikTok Shop',
    description: 'Auto-publish via API (requires connection)',
    requiresAuth: true,
    hasAPI: true,
    hasAutomation: false,
    url: 'https://seller-us.tiktok.com',
    category: 'both',
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram Shopping',
    description: 'Manual posting - Copy & paste listings',
    requiresAuth: false,
    hasAPI: false,
    hasAutomation: false,
    url: 'https://www.instagram.com',
    category: 'both',
  },
  ebay: {
    id: 'ebay',
    name: 'eBay',
    description: 'Auto-publish listings to eBay',
    requiresAuth: true,
    hasAPI: true,
    hasAutomation: false,
    url: 'https://www.ebay.com/sh/lst/active',
    category: 'both',
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook Marketplace',
    description: 'Manual posting - Copy & paste listings',
    requiresAuth: false,
    hasAPI: false,
    hasAutomation: false,
    url: 'https://www.facebook.com/marketplace/create/item',
    category: 'local',
  },
  craigslist: {
    id: 'craigslist',
    name: 'Craigslist',
    description: 'Browser automation (check email for verification)',
    requiresAuth: true,
    hasAPI: false,
    hasAutomation: true,
    url: 'https://accounts.craigslist.org/login',
    category: 'local',
  },
  offerup: {
    id: 'offerup',
    name: 'OfferUp',
    description: 'Browser automation when connected',
    requiresAuth: true,
    hasAPI: false,
    hasAutomation: true,
    url: 'https://offerup.com/sell/',
    category: 'local',
  },
  poshmark: {
    id: 'poshmark',
    name: 'Poshmark',
    description: 'Browser automation when connected',
    requiresAuth: true,
    hasAPI: false,
    hasAutomation: true,
    url: 'https://poshmark.com/create-listing',
    category: 'shipping',
  },
  mercari: {
    id: 'mercari',
    name: 'Mercari',
    description: 'Manual posting - Copy & paste listings',
    requiresAuth: false,
    hasAPI: false,
    hasAutomation: false,
    url: 'https://www.mercari.com/sell/',
    category: 'shipping',
  },
  nextdoor: {
    id: 'nextdoor',
    name: 'Nextdoor',
    description: 'Browser automation when connected',
    requiresAuth: true,
    hasAPI: false,
    hasAutomation: true,
    url: 'https://nextdoor.com/for_sale_and_free/',
    category: 'local',
  },
  etsy: {
    id: 'etsy',
    name: 'Etsy',
    description: 'Manual posting - Copy & paste listings',
    requiresAuth: false,
    hasAPI: false,
    hasAutomation: false,
    url: 'https://www.etsy.com/your/shops/me/tools/listings',
    category: 'shipping',
  },
};

// Helper arrays for filtering
export const LOCAL_MARKETPLACES = Object.values(MARKETPLACE_CONFIGS)
  .filter(m => m.category === 'local')
  .map(m => m.name);

export const SHIPPING_MARKETPLACES = Object.values(MARKETPLACE_CONFIGS)
  .filter(m => m.category === 'shipping')
  .map(m => m.name);

export const BOTH_MARKETPLACES = Object.values(MARKETPLACE_CONFIGS)
  .filter(m => m.category === 'both')
  .map(m => m.name);

export const ALL_MARKETPLACE_IDS = Object.keys(MARKETPLACE_CONFIGS);

export const getMarketplaceById = (id: string): MarketplaceConfig | undefined => {
  return MARKETPLACE_CONFIGS[id.toLowerCase()];
};

export const getMarketplaceByName = (name: string): MarketplaceConfig | undefined => {
  return Object.values(MARKETPLACE_CONFIGS).find(
    m => m.name.toLowerCase() === name.toLowerCase()
  );
};
