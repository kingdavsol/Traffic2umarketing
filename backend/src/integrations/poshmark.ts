/**
 * Poshmark Automation
 * Uses Puppeteer to automate posting to Poshmark
 * Note: Poshmark has no public API, this uses browser automation
 */

import puppeteer, { Browser, Page } from 'puppeteer-core';
import { logger } from '../config/logger';

interface PoshmarkListingData {
  title: string;
  description: string;
  price: number;
  category: string;
  brand?: string;
  size?: string;
  condition: string;
  color?: string;
  photos: string[]; // base64 or URLs
}

interface PoshmarkCredentials {
  email: string;
  password: string;
}

interface PostingResult {
  success: boolean;
  postingId?: string;
  url?: string;
  error?: string;
}

// Poshmark categories mapping
const CATEGORY_MAP: Record<string, { main: string; sub?: string }> = {
  'Women - Tops': { main: 'Women', sub: 'Tops' },
  'Women - Dresses': { main: 'Women', sub: 'Dresses' },
  'Women - Jeans': { main: 'Women', sub: 'Jeans' },
  'Women - Shoes': { main: 'Women', sub: 'Shoes' },
  'Women - Bags': { main: 'Women', sub: 'Bags' },
  'Women - Jewelry': { main: 'Women', sub: 'Jewelry' },
  'Women - Accessories': { main: 'Women', sub: 'Accessories' },
  'Men - Shirts': { main: 'Men', sub: 'Shirts' },
  'Men - Pants': { main: 'Men', sub: 'Pants' },
  'Men - Shoes': { main: 'Men', sub: 'Shoes' },
  'Men - Accessories': { main: 'Men', sub: 'Accessories' },
  'Kids - Girls': { main: 'Kids', sub: 'Girls' },
  'Kids - Boys': { main: 'Kids', sub: 'Boys' },
  'Home - Decor': { main: 'Home', sub: 'Home Decor' },
  'Electronics': { main: 'Electronics' },
  'Pets': { main: 'Pet Supplies' },
  'Toys': { main: 'Toys' },
  // Default fallback
  'General': { main: 'Other', sub: 'Other' },
};

// Condition mapping
const CONDITION_MAP: Record<string, string> = {
  'new': 'NWT (New With Tags)',
  'like new': 'NWOT (New Without Tags)',
  'excellent': 'Like New',
  'good': 'Good',
  'fair': 'Fair',
  'poor': 'Poor',
};

/**
 * Get Puppeteer browser instance
 * Reuses same logic as Craigslist integration
 */
const getBrowser = async (): Promise<Browser> => {
  // Try to connect to remote Chromium first (running on VPS host)
  const remoteUrl = process.env.CHROME_REMOTE_URL || "http://172.19.0.1:9222";
  try {
    const response = await fetch(remoteUrl + "/json/version");
    const data = await response.json() as { webSocketDebuggerUrl: string };
    if (data.webSocketDebuggerUrl) {
      const wsUrl = data.webSocketDebuggerUrl
        .replace("127.0.0.1", "172.19.0.1")
        .replace("localhost", "172.19.0.1");
      logger.info("Connecting to remote Chromium browser for Poshmark");
      return puppeteer.connect({ browserWSEndpoint: wsUrl });
    }
  } catch (e) {
    logger.warn("Remote Chromium not available, falling back to local: " + e);
  }

  // Fallback to local launch
  const executablePath = process.env.CHROME_PATH || "/usr/bin/chromium-browser";

  return puppeteer.launch({
    executablePath,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-software-rasterizer",
      "--disable-extensions",
      "--disable-web-security",
      "--no-first-run",
      "--no-zygote",
      "--single-process",
      "--disable-features=VizDisplayCompositor",
    ],
  });
};

/**
 * Login to Poshmark account
 */
const loginToPoshmark = async (
  page: Page,
  credentials: PoshmarkCredentials
): Promise<boolean> => {
  try {
    logger.info('Navigating to Poshmark login page');
    await page.goto('https://poshmark.com/login', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Wait for login form to be visible
    await page.waitForSelector('input[name="login_form[username_email]"]', { timeout: 10000 });

    // Fill in login form
    logger.info('Filling Poshmark login credentials');
    await page.type('input[name="login_form[username_email]"]', credentials.email);
    await page.type('input[name="login_form[password]"]', credentials.password);

    // Click login button
    await page.click('button[type="submit"]');

    // Wait for navigation or error
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {
      logger.warn('Navigation timeout after login attempt');
    });

    // Check if login was successful
    const url = page.url();
    if (!url.includes('login')) {
      logger.info('Poshmark login successful');
      return true;
    }

    // Check for error messages
    const errorElement = await page.$('.error-msg, .alert-danger');
    if (errorElement) {
      const errorText = await page.evaluate(el => el.textContent, errorElement);
      logger.error('Poshmark login failed:', errorText);
    }

    return false;
  } catch (error) {
    logger.error('Poshmark login error:', error);
    return false;
  }
};

/**
 * Post a listing to Poshmark
 */
export const postToPoshmark = async (
  credentials: PoshmarkCredentials,
  listingData: PoshmarkListingData
): Promise<PostingResult> => {
  let browser: Browser | null = null;

  try {
    logger.info('Starting Poshmark posting automation');
    browser = await getBrowser();
    const page = await browser.newPage();

    // Set realistic viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // Login first
    const loggedIn = await loginToPoshmark(page, credentials);
    if (!loggedIn) {
      return { success: false, error: 'Failed to login to Poshmark. Please check credentials.' };
    }

    // Navigate to create listing page
    logger.info('Navigating to Poshmark listing creation page');
    await page.goto('https://poshmark.com/create-listing', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Wait for the form to load
    await page.waitForSelector('input[name="title"]', { timeout: 10000 });

    // Fill in title (max 80 characters for Poshmark)
    const truncatedTitle = listingData.title.substring(0, 80);
    logger.info('Filling listing title:', truncatedTitle);
    await page.type('input[name="title"]', truncatedTitle);

    // Fill in description
    logger.info('Filling listing description');
    const descriptionSelector = 'textarea[name="description"]';
    await page.waitForSelector(descriptionSelector, { timeout: 10000 });
    await page.type(descriptionSelector, listingData.description);

    // Select category
    if (listingData.category) {
      logger.info('Selecting category:', listingData.category);
      const categoryInfo = getCategoryInfo(listingData.category);

      // Click category dropdown
      const categoryDropdown = await page.$('select[name="department"], .category-selector');
      if (categoryDropdown) {
        await categoryDropdown.click();
        await new Promise(resolve => setTimeout(resolve, 500));

        // Try to select the category
        const categoryOption = await page.$(`option[value*="${categoryInfo.main}"]`);
        if (categoryOption) {
          await categoryOption.click();
        }
      }
    }

    // Fill in brand if provided
    if (listingData.brand) {
      logger.info('Filling brand:', listingData.brand);
      const brandInput = await page.$('input[name="brand"]');
      if (brandInput) {
        await brandInput.type(listingData.brand);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Fill in size if provided
    if (listingData.size) {
      logger.info('Filling size:', listingData.size);
      const sizeInput = await page.$('input[name="size"], select[name="size"]');
      if (sizeInput) {
        await sizeInput.type(listingData.size);
      }
    }

    // Fill in color if provided
    if (listingData.color) {
      logger.info('Filling color:', listingData.color);
      const colorInput = await page.$('input[name="color"]');
      if (colorInput) {
        await colorInput.type(listingData.color);
      }
    }

    // Select condition
    logger.info('Selecting condition:', listingData.condition);
    const condition = getCondition(listingData.condition);
    const conditionSelect = await page.$('select[name="condition"]');
    if (conditionSelect) {
      await page.select('select[name="condition"]', condition);
    }

    // Fill in price (Poshmark requires price in dollars)
    logger.info('Filling price:', listingData.price);
    const priceInput = await page.$('input[name="price"]');
    if (priceInput) {
      await priceInput.type(listingData.price.toString());
    }

    // Handle image upload if photos are provided
    if (listingData.photos && listingData.photos.length > 0) {
      logger.info(`Uploading ${listingData.photos.length} images to Poshmark`);

      try {
        // Find the file input element for photos
        const fileInput = await page.$('input[type="file"][accept*="image"]');

        if (fileInput) {
          // Process each photo (max 16 for Poshmark)
          const photosToUpload = listingData.photos.slice(0, 16);

          for (let i = 0; i < photosToUpload.length; i++) {
            const photo = photosToUpload[i];

            // Check if it's a base64 string or URL
            if (photo.startsWith('data:image') || photo.startsWith('/9j/') || photo.startsWith('iVBOR')) {
              // Convert base64 to buffer and create temp file
              const fs = await import('fs').then(m => m.promises);
              const path = await import('path');
              const os = await import('os');

              // Handle both data URI and raw base64
              const base64Data = photo.includes(',') ? photo.split(',')[1] : photo;
              const buffer = Buffer.from(base64Data, 'base64');

              // Detect image type from base64 header
              let ext = 'jpg';
              if (photo.includes('image/png') || base64Data.startsWith('iVBOR')) {
                ext = 'png';
              } else if (photo.includes('image/webp')) {
                ext = 'webp';
              }

              // Create temp file
              const tempDir = os.tmpdir();
              const tempFile = path.join(tempDir, `poshmark_upload_${Date.now()}_${i}.${ext}`);
              await fs.writeFile(tempFile, buffer);

              // Upload the file
              await fileInput.uploadFile(tempFile);
              logger.info(`Uploaded image ${i + 1}/${photosToUpload.length}`);

              // Wait for upload to process
              await new Promise(resolve => setTimeout(resolve, 2000));

              // Clean up temp file
              await fs.unlink(tempFile).catch(() => {});
            } else if (photo.startsWith('http')) {
              // For URL-based images, we need to download first
              logger.info(`Skipping URL-based image ${i + 1} - download not implemented`);
            }
          }

          // Wait for all uploads to complete
          await new Promise(resolve => setTimeout(resolve, 3000));
          logger.info('Image uploads completed');
        } else {
          logger.warn('Could not find file input for Poshmark photo upload');
        }
      } catch (uploadError) {
        logger.error('Error uploading images to Poshmark:', uploadError);
        // Continue with listing even if image upload fails
      }
    }

    // Submit the listing
    logger.info('Submitting Poshmark listing');
    const submitButton = await page.$('button[type="submit"], .btn-primary');
    if (submitButton) {
      await submitButton.click();

      // Wait for submission to complete
      await page.waitForNavigation({
        waitUntil: 'networkidle2',
        timeout: 20000
      }).catch(() => {
        logger.warn('Navigation timeout after submit');
      });
    }

    // Try to extract listing URL
    const finalUrl = page.url();
    let postingId: string | undefined;
    let listingUrl: string | undefined;

    if (finalUrl.includes('/listing/')) {
      // Extract listing ID from URL (format: /listing/{id})
      const match = finalUrl.match(/\/listing\/([a-zA-Z0-9-]+)/);
      if (match) {
        postingId = match[1];
        listingUrl = finalUrl;
        logger.info('Poshmark listing created successfully:', listingUrl);
      }
    }

    // Check for success indicators
    const successIndicator = await page.$('.success-message, .alert-success');
    if (successIndicator || listingUrl) {
      return {
        success: true,
        postingId,
        url: listingUrl,
      };
    }

    // Check for error messages
    const errorElement = await page.$('.error-message, .alert-danger');
    if (errorElement) {
      const errorText = await page.evaluate(el => el.textContent, errorElement);
      logger.error('Poshmark posting error:', errorText);
      return {
        success: false,
        error: errorText || 'Failed to post to Poshmark',
      };
    }

    // If we got here, assume success but without confirmation
    return {
      success: true,
      postingId,
      url: listingUrl,
    };

  } catch (error: any) {
    logger.error('Poshmark posting error:', error);
    return {
      success: false,
      error: error.message || 'Failed to post to Poshmark',
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

/**
 * Get category info from category name
 */
function getCategoryInfo(category: string): { main: string; sub?: string } {
  const normalized = category.toLowerCase().trim();

  for (const [key, value] of Object.entries(CATEGORY_MAP)) {
    if (normalized.includes(key.toLowerCase())) {
      return value;
    }
  }

  // Default to Other
  return CATEGORY_MAP['General'];
}

/**
 * Get condition from condition string
 */
function getCondition(condition: string): string {
  const normalized = condition.toLowerCase().trim();
  return CONDITION_MAP[normalized] || CONDITION_MAP['good'];
}

/**
 * Check if Poshmark posting is possible (browser available)
 */
export const isAvailable = async (): Promise<boolean> => {
  try {
    const browser = await getBrowser();
    await browser.close();
    return true;
  } catch (error) {
    logger.warn('Poshmark automation not available:', error);
    return false;
  }
};

export default {
  postToPoshmark,
  isAvailable,
};
