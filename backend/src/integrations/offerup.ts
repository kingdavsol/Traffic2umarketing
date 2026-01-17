// @ts-nocheck
/**
 * OfferUp Automation
 * Uses Puppeteer to automate posting to OfferUp
 * Note: OfferUp has no official API, this uses browser automation
 */

import puppeteer, { Browser, Page } from 'puppeteer-core';
import { logger } from '../config/logger';

interface OfferUpListingData {
  title: string;
  description: string;
  price: number;
  category: string;
  condition?: string; // new, like-new, good, fair
  photos: string[]; // base64 or URLs
  location: {
    city: string;
    zipcode?: string;
  };
}

interface OfferUpCredentials {
  email: string;
  password: string;
}

interface PostingResult {
  success: boolean;
  postingId?: string;
  error?: string;
  postingUrl?: string;
}

// Category mapping for OfferUp
const CATEGORY_MAP: Record<string, string> = {
  'Electronics': 'Electronics',
  'Computers': 'Electronics',
  'Cell Phones': 'Cell Phones & Accessories',
  'Furniture': 'Furniture',
  'Home & Garden': 'Home & Garden',
  'Clothing': 'Clothing & Shoes',
  'Jewelry': 'Jewelry & Accessories',
  'Sporting Goods': 'Sporting Goods',
  'Toys & Games': 'Toys & Games',
  'Tools': 'Tools',
  'Bikes': 'Bikes',
  'Books': 'Books, Movies & Music',
  'Video Games': 'Video Games & Consoles',
  'Baby & Kids': 'Baby & Kids',
  'Appliances': 'Appliances',
  'General': 'Everything Else',
};

// Condition mapping
const CONDITION_MAP: Record<string, string> = {
  'new': 'New',
  'like-new': 'Like new',
  'good': 'Good',
  'fair': 'Fair',
};

/**
 * Timeout wrapper for promises
 */
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    )
  ]);
};

/**
 * Get Puppeteer browser instance
 */
const getBrowser = async (): Promise<Browser> => {
  const remoteUrl = process.env.CHROME_REMOTE_URL || "http://172.19.0.1:9222";

  try {
    const response = await fetch(remoteUrl + "/json/version");
    const data = await response.json() as { webSocketDebuggerUrl: string };
    if (data.webSocketDebuggerUrl) {
      const wsUrl = data.webSocketDebuggerUrl
        .replace("127.0.0.1", "172.19.0.1")
        .replace("localhost", "172.19.0.1");
      logger.info("[OfferUp] Connecting to remote Chromium browser at " + wsUrl);
      return await withTimeout(
        puppeteer.connect({ browserWSEndpoint: wsUrl }),
        10000,
        'Timeout connecting to remote Chromium'
      );
    }
  } catch (e) {
    logger.warn("[OfferUp] Remote Chromium not available, falling back to local: " + e);
  }

  const executablePath = process.env.CHROME_PATH || "/usr/bin/chromium-browser";
  logger.info("[OfferUp] Attempting to launch local Chromium at " + executablePath);

  try {
    const browser = await withTimeout(
      puppeteer.launch({
        executablePath,
        headless: true,
        protocolTimeout: 60000, // 60 second timeout for Puppeteer protocol operations
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--single-process",
          "--disable-features=VizDisplayCompositor",
        ],
      }),
      15000,
      'Timeout launching local Chromium browser'
    );

    logger.info("[OfferUp] Local Chromium launched successfully");
    return browser;
  } catch (launchError) {
    logger.error("[OfferUp] Failed to launch Chromium: " + launchError);
    throw new Error("Chromium browser not available. Please ensure Chromium is installed.");
  }
};

/**
 * Login to OfferUp account
 */
const loginToOfferUp = async (
  page: Page,
  credentials: OfferUpCredentials
): Promise<boolean> => {
  try {
    logger.info('[OfferUp] Navigating to login page');
    await page.goto('https://offerup.com/login', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Wait for email input and fill
    await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });
    await page.type('input[type="email"], input[name="email"]', credentials.email);

    // Wait for password input and fill
    await page.waitForSelector('input[type="password"]', { timeout: 5000 });
    await page.type('input[type="password"]', credentials.password);

    // Click login button
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });

    // Check if login was successful (should redirect away from login page)
    const url = page.url();
    if (!url.includes('/login')) {
      logger.info('[OfferUp] Login successful');
      return true;
    }

    logger.error('[OfferUp] Login failed - still on login page');
    return false;
  } catch (error) {
    logger.error('[OfferUp] Login error:', error);
    return false;
  }
};

/**
 * Post a listing to OfferUp
 */
export const postToOfferUp = async (
  credentials: OfferUpCredentials,
  listingData: OfferUpListingData
): Promise<PostingResult> => {
  let browser: Browser | null = null;

  try {
    logger.info(`[OfferUp] Starting publish for listing: ${listingData.title}`);

    browser = await getBrowser();
    const page = await browser.newPage();

    // Set a realistic user agent
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // Login first
    const loggedIn = await loginToOfferUp(page, credentials);
    if (!loggedIn) {
      return { success: false, error: 'Failed to login to OfferUp' };
    }

    // Navigate to create listing page
    logger.info('[OfferUp] Navigating to create listing page');
    await page.goto('https://offerup.com/sell/', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Fill in title
    logger.info('[OfferUp] Filling listing details');
    await page.waitForSelector('input[placeholder*="title"], input[name="title"]', { timeout: 10000 });
    await page.type('input[placeholder*="title"], input[name="title"]', listingData.title);

    // Fill in price
    await page.waitForSelector('input[placeholder*="price"], input[name="price"]', { timeout: 5000 });
    await page.type('input[placeholder*="price"], input[name="price"]', listingData.price.toString());

    // Fill in description
    await page.waitForSelector('textarea[placeholder*="description"], textarea[name="description"]', { timeout: 5000 });
    await page.type('textarea[placeholder*="description"], textarea[name="description"]', listingData.description);

    // Select category
    const category = getCategoryName(listingData.category);
    logger.info(`[OfferUp] Selecting category: ${category}`);
    try {
      await page.click('button[aria-label*="Category"], select[name="category"]');
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Try to click the category option
      // @ts-ignore - Browser context has document global
      await page.evaluate((cat) => {
        const buttons = Array.from(document.querySelectorAll('button, option'));
        const button = buttons.find(el => el.textContent?.includes(cat));
        if (button) button.click();
      }, category);
    } catch (e) {
      logger.warn(`[OfferUp] Could not select category: ${e}`);
    }

    // Select condition if provided
    if (listingData.condition) {
      const condition = getConditionName(listingData.condition);
      logger.info(`[OfferUp] Selecting condition: ${condition}`);
      try {
        await page.click('button[aria-label*="Condition"], select[name="condition"]');
        await new Promise(resolve => setTimeout(resolve, 1000));
        // @ts-ignore - Browser context has document global
        await page.evaluate((cond) => {
          const buttons = Array.from(document.querySelectorAll('button, option'));
          const button = buttons.find(el => el.textContent?.includes(cond));
          if (button) button.click();
        }, condition);
      } catch (e) {
        logger.warn(`[OfferUp] Could not select condition: ${e}`);
      }
    }

    // Set location/zipcode if available
    if (listingData.location.zipcode) {
      try {
        await page.waitForSelector('input[placeholder*="zip"], input[name="zipcode"]', { timeout: 5000 });
        await page.type('input[placeholder*="zip"], input[name="zipcode"]', listingData.location.zipcode);
      } catch (e) {
        logger.warn('[OfferUp] Zipcode field not found');
      }
    }

    // Note: Image upload would need file handling - skipping for MVP
    if (listingData.photos && listingData.photos.length > 0) {
      logger.info('[OfferUp] Skipping image upload (not implemented)');
    }

    // Submit the listing
    logger.info('[OfferUp] Submitting listing');
    const submitButton = await page.$('button[type="submit"], button:contains("Post"), button:contains("Publish")');
    if (submitButton) {
      await submitButton.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
    }

    // Try to extract posting URL
    const finalUrl = page.url();
    logger.info(`[OfferUp] Final URL: ${finalUrl}`);

    // If we're on an item page, we succeeded
    if (finalUrl.includes('/item/') || !finalUrl.includes('/sell')) {
      const postingIdMatch = finalUrl.match(/\/item\/([^\/]+)/);
      const postingId = postingIdMatch ? postingIdMatch[1] : undefined;

      logger.info(`[OfferUp] Posting successful: ${postingId}`);
      return {
        success: true,
        postingId,
        postingUrl: finalUrl,
      };
    }

    // Check if we're still on the sell page (might indicate error)
    if (finalUrl.includes('/sell')) {
      logger.warn('[OfferUp] Still on sell page - posting may have failed');
      return {
        success: false,
        error: 'Posting may have failed - please check OfferUp website',
      };
    }

    return {
      success: true,
      postingUrl: finalUrl,
    };
  } catch (error: any) {
    logger.error('[OfferUp] Posting error:', error);
    return {
      success: false,
      error: error.message || 'Failed to post to OfferUp',
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

/**
 * Get category name from category
 */
function getCategoryName(category: string): string {
  for (const [key, value] of Object.entries(CATEGORY_MAP)) {
    if (category.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  return 'Everything Else'; // Default
}

/**
 * Get condition name
 */
function getConditionName(condition: string): string {
  return CONDITION_MAP[condition.toLowerCase()] || 'Good';
}

/**
 * Check if OfferUp posting is possible (browser available)
 */
export const isAvailable = async (): Promise<boolean> => {
  try {
    const browser = await getBrowser();
    await browser.close();
    return true;
  } catch (error) {
    logger.warn('[OfferUp] Automation not available:', error);
    return false;
  }
};

export default {
  postToOfferUp,
  isAvailable,
};
