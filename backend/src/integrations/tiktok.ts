/**
 * TikTok Shop API Integration
 * Official API documentation: https://partner.tiktokshop.com/
 * Base URL: https://open-api.tiktokglobalshop.com/api
 *
 * Note: Requires TikTok Shop seller account and approved API access
 * Apply at: https://partner.tiktokshop.com/
 */

import crypto from 'crypto';
import { logger } from '../config/logger';

interface TikTokCredentials {
  appKey: string;
  appSecret: string;
  accessToken: string;
  shopId?: string;
  shopCipher?: string;
}

interface TikTokProduct {
  title: string;
  description: string;
  category_id: string;
  brand_id?: string;
  main_images: TikTokImage[];
  package_weight: {
    value: string;
    unit: string; // 'KILOGRAM' | 'POUND'
  };
  package_dimensions: {
    height: string;
    length: string;
    width: string;
    unit: string; // 'CENTIMETER' | 'INCH'
  };
  skus: TikTokSku[];
  is_cod_allowed?: boolean; // Cash on delivery
  delivery_option_ids?: string[];
}

interface TikTokImage {
  id?: string;
  url?: string;
  thumb_urls?: string[];
}

interface TikTokSku {
  id?: string;
  seller_sku?: string;
  sales_attributes?: Array<{
    attribute_id: string;
    value_id: string;
  }>;
  stock_infos: Array<{
    warehouse_id: string;
    available_stock: number;
  }>;
  price: {
    amount: string;
    currency: string; // 'USD', 'GBP', etc.
  };
  original_price?: {
    amount: string;
    currency: string;
  };
}

interface TikTokApiResponse {
  code: number;
  message: string;
  data?: any;
  request_id?: string;
}

interface ProductCreationResult {
  success: boolean;
  productId?: string;
  url?: string;
  error?: string;
}

const BASE_URL = 'https://open-api.tiktokglobalshop.com';
const API_VERSION = '202309'; // Update to latest version when available

/**
 * Generate signature for TikTok Shop API request
 * Documentation: https://partner.tiktokshop.com/docv2/page/sign-your-api-request
 */
function generateSignature(
  appSecret: string,
  path: string,
  timestamp: number,
  params: Record<string, any> = {}
): string {
  // Sort parameters by key
  const sortedKeys = Object.keys(params).sort();

  // Build param string
  let paramString = '';
  for (const key of sortedKeys) {
    paramString += key + params[key];
  }

  // Build signature base string
  const signString = appSecret + path + paramString + timestamp + appSecret;

  // Generate HMAC-SHA256 signature
  const signature = crypto
    .createHmac('sha256', appSecret)
    .update(signString)
    .digest('hex');

  return signature;
}

/**
 * Make authenticated request to TikTok Shop API
 */
async function makeApiRequest(
  credentials: TikTokCredentials,
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<TikTokApiResponse> {
  const timestamp = Math.floor(Date.now() / 1000);
  const path = `/api${endpoint}`;

  // Common parameters
  const params: Record<string, any> = {
    app_key: credentials.appKey,
    timestamp: timestamp.toString(),
    version: API_VERSION,
  };

  if (credentials.shopId) {
    params.shop_id = credentials.shopId;
  }

  if (credentials.shopCipher) {
    params.shop_cipher = credentials.shopCipher;
  }

  // Generate signature
  const signature = generateSignature(
    credentials.appSecret,
    path,
    timestamp,
    method === 'POST' && body ? { ...params, ...body } : params
  );

  params.sign = signature;

  // Build URL with query parameters
  const queryString = new URLSearchParams(params).toString();
  const url = `${BASE_URL}${path}?${queryString}`;

  logger.info(`TikTok Shop API Request: ${method} ${endpoint}`);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-tts-access-token': credentials.accessToken,
      },
      body: method !== 'GET' && body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json() as TikTokApiResponse;

    if (data.code !== 0) {
      logger.error('TikTok Shop API Error:', {
        code: data.code,
        message: data.message,
        request_id: data.request_id,
      });
    }

    return data;
  } catch (error: any) {
    logger.error('TikTok Shop API Request Failed:', error);
    return {
      code: -1,
      message: error.message || 'Network error',
    };
  }
}

/**
 * Upload image to TikTok Shop
 * Endpoint: /product/upload_image
 */
export async function uploadImage(
  credentials: TikTokCredentials,
  imageUrl: string
): Promise<{ success: boolean; imageId?: string; error?: string }> {
  try {
    const response = await makeApiRequest(
      credentials,
      '/product/upload_image',
      'POST',
      {
        img_url: imageUrl,
      }
    );

    if (response.code === 0 && response.data?.id) {
      return {
        success: true,
        imageId: response.data.id,
      };
    }

    return {
      success: false,
      error: response.message || 'Failed to upload image',
    };
  } catch (error: any) {
    logger.error('TikTok image upload error:', error);
    return {
      success: false,
      error: error.message || 'Image upload failed',
    };
  }
}

/**
 * Create a product on TikTok Shop
 * Endpoint: /product/create_product (or similar based on official docs)
 *
 * NOTE: This is a placeholder implementation. Update endpoint and payload
 * structure based on official TikTok Shop Partner Center documentation
 * once you have API access.
 */
export async function createProduct(
  credentials: TikTokCredentials,
  product: TikTokProduct
): Promise<ProductCreationResult> {
  try {
    logger.info('Creating product on TikTok Shop:', product.title);

    // TODO: Update this endpoint based on official documentation
    const response = await makeApiRequest(
      credentials,
      '/product/create',
      'POST',
      {
        product_name: product.title,
        description: product.description,
        category_id: product.category_id,
        brand_id: product.brand_id,
        main_images: product.main_images,
        package_weight: product.package_weight,
        package_dimensions: product.package_dimensions,
        skus: product.skus,
        is_cod_allowed: product.is_cod_allowed,
        delivery_option_ids: product.delivery_option_ids,
      }
    );

    if (response.code === 0 && response.data?.product_id) {
      logger.info('TikTok Shop product created successfully:', response.data.product_id);
      return {
        success: true,
        productId: response.data.product_id,
        url: response.data.product_url, // If available in response
      };
    }

    return {
      success: false,
      error: response.message || 'Failed to create product on TikTok Shop',
    };
  } catch (error: any) {
    logger.error('TikTok Shop product creation error:', error);
    return {
      success: false,
      error: error.message || 'Product creation failed',
    };
  }
}

/**
 * Get product categories
 * Endpoint: /product/categories
 */
export async function getCategories(
  credentials: TikTokCredentials,
  parentCategoryId?: string
): Promise<{ success: boolean; categories?: any[]; error?: string }> {
  try {
    const endpoint = parentCategoryId
      ? `/product/categories?parent_id=${parentCategoryId}`
      : '/product/categories';

    const response = await makeApiRequest(credentials, endpoint, 'GET');

    if (response.code === 0 && response.data?.categories) {
      return {
        success: true,
        categories: response.data.categories,
      };
    }

    return {
      success: false,
      error: response.message || 'Failed to fetch categories',
    };
  } catch (error: any) {
    logger.error('TikTok Shop categories fetch error:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch categories',
    };
  }
}

/**
 * Check if TikTok Shop API credentials are valid
 */
export async function validateCredentials(
  credentials: TikTokCredentials
): Promise<boolean> {
  try {
    // Test with a simple API call (get authorized shops)
    const response = await makeApiRequest(
      credentials,
      '/authorization/get_authorized_shop',
      'GET'
    );

    return response.code === 0;
  } catch (error) {
    logger.error('TikTok Shop credential validation error:', error);
    return false;
  }
}

/**
 * Convert Quicksell listing to TikTok Shop product format
 */
export function convertQuicksellToTikTokProduct(
  listing: any,
  categoryId: string,
  warehouseId: string
): TikTokProduct {
  // Calculate approximate package dimensions based on category
  // TODO: Make this more sophisticated or allow user input
  const defaultDimensions = {
    height: '10',
    length: '15',
    width: '10',
    unit: 'CENTIMETER',
  };

  const defaultWeight = {
    value: '0.5',
    unit: 'KILOGRAM',
  };

  return {
    title: listing.title,
    description: listing.description,
    category_id: categoryId,
    main_images: listing.photos?.slice(0, 9).map((url: string) => ({ url })) || [],
    package_weight: defaultWeight,
    package_dimensions: defaultDimensions,
    skus: [
      {
        stock_infos: [
          {
            warehouse_id: warehouseId,
            available_stock: 1, // Single item for resale
          },
        ],
        price: {
          amount: listing.price.toString(),
          currency: 'USD',
        },
      },
    ],
    is_cod_allowed: false,
  };
}

export default {
  createProduct,
  uploadImage,
  getCategories,
  validateCredentials,
  convertQuicksellToTikTokProduct,
};
