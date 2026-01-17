/**
 * Nextdoor Automation
 * Uses Puppeteer to automate posting to Nextdoor For Sale & Free
 * Note: Nextdoor has no official API, this uses browser automation
 */

import puppeteer, { Browser, Page } from 'puppeteer-core';
import { logger } from '../config/logger';

interface NextdoorListingData {
  title: string;
  description: string;
  price: number;
  category: string;
  condition?: string; // new, like-new, good, fair
  photos: string[]; // base64 or URLs
}

interface NextdoorCredentials {
  email: string;
  password: string;
}

interface PostingResult {
  success: boolean;
  postingId?: string;
  error?: string;
  postingUrl?: string;
}

// Category mapping for Nextdoor
const CATEGORY_MAP: Record<string, string> = {
  'Electronics': 'Electronics',
  'Computers': 'Electronics',
  'Cell Phones': 'Electronics',
  'Furniture': 'Furniture',
  'Home & Garden': 'Home & Garden',
  'Clothing': 'Clothing & Accessories',
  'Jewelry': 'Clothing & Accessories',
  'Sporting Goods': 'Sports & Outdoors',
  'Toys & Games': 'Toys & Games',
  'Tools': 'Tools',
  'Books': 'Books & Magazines',
  'Baby & Kids': 'Baby & Kids',
  'Appliances': 'Appliances',
  'General': 'Other',
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
      logger.info("[Nextdoor] Connecting to remote Chromium browser at " + wsUrl);
      return await withTimeout(
        puppeteer.connect({ browserWSEndpoint: wsUrl }),
        10000,
        'Timeout connecting to remote Chromium'
      );
    }
  } catch (e) {
    logger.warn("[Nextdoor] Remote Chromium not available, falling back to local: " + e);
  }

  const executablePath = process.env.CHROME_PATH || "/usr/bin/chromium-browser";
  logger.info("[Nextdoor] Attempting to launch local Chromium at " + executablePath);

  try {
    const browser = await withTimeout(
      puppeteer.launch({
        executablePath,
        headless: true,
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

    logger.info("[Nextdoor] Local Chromium launched successfully");
    return browser;
  } catch (launchError) {
    logger.error("[Nextdoor] Failed to launch Chromium: " + launchError);
    throw new Error("Chromium browser not available. Please ensure Chromium is installed.");
  }
};

/**
 * Login to Nextdoor account
 */
const loginToNextdoor = async (
  page: Page,
  credentials: NextdoorCredentials
): Promise<boolean> => {
  try {
    logger.info('[Nextdoor] Navigating to login page');
    await page.goto('https://nextdoor.com/login/', {
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
    await page.click('button[type="submit"], button:contains("Sign in")');

    // Wait for navigation
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });

    // Check if login was successful (should redirect away from login page)
    const url = page.url();
    if (!url.includes('/login')) {
      logger.info('[Nextdoor] Login successful');
      return true;
    }

    logger.error('[Nextdoor] Login failed - still on login page');
    return false;
  } catch (error) {
    logger.error('[Nextdoor] Login error:', error);
    return false;
  }
};

/**
 * Post a listing to Nextdoor For Sale & Free
 */
export const postToNextdoor = async (
  credentials: NextdoorCredentials,
  listingData: NextdoorListingData
): Promise<PostingResult> => {
  let browser: Browser | null = null;

  try {
    logger.info(`[Nextdoor] Starting publish for listing: ${listingData.title}`);

    browser = await getBrowser();
    const page = await browser.newPage();

    // Set a realistic user agent
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // Login first
    const loggedIn = await loginToNextdoor(page, credentials);
    if (!loggedIn) {
      return { success: false, error: 'Failed to login to Nextdoor' };
    }

    // Navigate to For Sale & Free section
    logger.info('[Nextdoor] Navigating to For Sale & Free');
    await page.goto('https://nextdoor.com/for_sale_and_free/', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Click "Sell an item" or "Post" button
    try {
      const postButton = await page.$('button:contains("Sell"), button:contains("Post"), a[href*="/sell"]');
      if (postButton) {
        await postButton.click();
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        // Try alternative - might be direct URL
        await page.goto('https://nextdoor.com/sell/new/', {
          waitUntil: 'networkidle2',
          timeout: 30000,
        });
      }
    } catch (e) {
      logger.info('[Nextdoor] Trying direct sell URL');
      await page.goto('https://nextdoor.com/sell/new/', {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });
    }

    // Fill in title
    logger.info('[Nextdoor] Filling listing details');
    await page.waitForSelector('input[placeholder*="title"], input[name="title"], input[placeholder*="What are you selling"]', { timeout: 10000 });
    await page.type('input[placeholder*="title"], input[name="title"], input[placeholder*="What are you selling"]', listingData.title);

    // Fill in price
    await page.waitForSelector('input[placeholder*="price"], input[name="price"], input[type="number"]', { timeout: 5000 });
    await page.type('input[placeholder*="price"], input[name="price"], input[type="number"]', listingData.price.toString());

    // Fill in description
    await page.waitForSelector('textarea[placeholder*="description"], textarea[name="description"], textarea[placeholder*="details"]', { timeout: 5000 });
    await page.type('textarea[placeholder*="description"], textarea[name="description"], textarea[placeholder*="details"]', listingData.description);

    // Select category if field exists
    const category = getCategoryName(listingData.category);
    logger.info(`[Nextdoor] Selecting category: ${category}`);
    try {
      await page.click('select[name="category"], button[aria-label*="Category"]');
      await new Promise(resolve => setTimeout(resolve, 1000));
      await page.evaluate((cat: string) => {
        const options = Array.from(document.querySelectorAll('option, button, div[role="option"]'));
        const option = options.find((el: Element) => el.textContent?.includes(cat));
        if (option) (option as HTMLElement).click();
      }, category);
    } catch (e) {
      logger.warn(`[Nextdoor] Could not select category: ${e}`);
    }

    // Select condition if provided
    if (listingData.condition) {
      try {
        const condition = listingData.condition.charAt(0).toUpperCase() + listingData.condition.slice(1);
        await page.click('select[name="condition"], button[aria-label*="Condition"]');
        await new Promise(resolve => setTimeout(resolve, 1000));
        await page.evaluate((cond: string) => {
          const options = Array.from(document.querySelectorAll('option, button, div[role="option"]'));
          const option = options.find((el: Element) => el.textContent?.includes(cond));
          if (option) (option as HTMLElement).click();
        }, condition);
      } catch (e) {
        logger.warn(`[Nextdoor] Could not select condition: ${e}`);
      }
    }

    // Note: Image upload would need file handling - skipping for MVP
    if (listingData.photos && listingData.photos.length > 0) {
      logger.info('[Nextdoor] Skipping image upload (not implemented)');
    }

    // Submit the listing
    logger.info('[Nextdoor] Submitting listing');
    const submitButton = await page.$('button[type="submit"], button:contains("Post"), button:contains("Publish")');
    if (submitButton) {
      await submitButton.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {
        // Navigation might not happen if it's a SPA
        logger.info('[Nextdoor] No navigation detected, checking current page');
      });
    }

    // Wait a bit for any client-side routing
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Try to extract posting URL
    const finalUrl = page.url();
    logger.info(`[Nextdoor] Final URL: ${finalUrl}`);

    // If we're on a for_sale_and_free page but not on /sell/new, we likely succeeded
    if (finalUrl.includes('/for_sale_and_free/') && !finalUrl.includes('/sell/new')) {
      const postingIdMatch = finalUrl.match(/\/([0-9]+)/);
      const postingId = postingIdMatch ? postingIdMatch[1] : undefined;

      logger.info(`[Nextdoor] Posting successful: ${postingId}`);
      return {
        success: true,
        postingId,
        postingUrl: finalUrl,
      };
    }

    // Check if we're still on the sell/new page (might indicate error)
    if (finalUrl.includes('/sell/new')) {
      logger.warn('[Nextdoor] Still on new listing page - posting may have failed');

      // Check for error messages
      const errorElements = await page.$$('.error, [role="alert"], .alert-danger');
      if (errorElements.length > 0) {
        const errorText = await page.evaluate(() => {
          const errors = Array.from(document.querySelectorAll('.error, [role="alert"], .alert-danger'));
          return errors.map((el: Element) => el.textContent).join(', ');
        });
        return {
          success: false,
          error: `Nextdoor error: ${errorText}`,
        };
      }

      return {
        success: false,
        error: 'Posting may have failed - please check Nextdoor website',
      };
    }

    // Assume success if we got here
    return {
      success: true,
      postingUrl: finalUrl,
    };
  } catch (error: any) {
    logger.error('[Nextdoor] Posting error:', error);
    return {
      success: false,
      error: error.message || 'Failed to post to Nextdoor',
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
  return 'Other'; // Default
}

/**
 * Check if Nextdoor posting is possible (browser available)
 */
export const isAvailable = async (): Promise<boolean> => {
  try {
    const browser = await getBrowser();
    await browser.close();
    return true;
  } catch (error) {
    logger.warn('[Nextdoor] Automation not available:', error);
    return false;
  }
};

export default {
  postToNextdoor,
  isAvailable,
};
