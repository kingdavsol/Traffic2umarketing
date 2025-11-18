/**
 * Simple in-memory cache with TTL support
 * In production, use Redis for distributed caching
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class Cache<T> {
  private store: Map<string, CacheEntry<T>> = new Map();

  /**
   * Set a value in cache with TTL
   * @param key Cache key
   * @param data Data to cache
   * @param ttlMs Time to live in milliseconds
   */
  set(key: string, data: T, ttlMs: number = 60 * 60 * 1000): void {
    const expiresAt = Date.now() + ttlMs;
    this.store.set(key, { data, expiresAt });
  }

  /**
   * Get a value from cache
   * Returns null if key doesn't exist or has expired
   */
  get(key: string): T | null {
    const entry = this.store.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Check if key exists and hasn't expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete a key from cache
   */
  delete(key: string): boolean {
    return this.store.delete(key);
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.store.size;
  }

  /**
   * Get all expired keys and remove them
   */
  cleanup(): number {
    let removed = 0;
    const now = Date.now();

    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
        removed++;
      }
    }

    return removed;
  }
}

/**
 * Create cache with generic typing
 */
export function createCache<T>(): Cache<T> {
  return new Cache<T>();
}

/**
 * Global caches for different data types
 */
export const vehicleCache = createCache<any>();
export const partsCache = createCache<any>();
export const tiresCache = createCache<any>();
export const valuationCache = createCache<any>();
export const problemsCache = createCache<any>();

/**
 * Cache key builders for consistency
 */
export const cacheKeys = {
  vehicle: (make: string, model: string, year: number) =>
    `vehicle:${make}:${model}:${year}`,

  problems: (make: string, model: string, year?: number) =>
    `problems:${make}:${model}:${year || 'all'}`,

  parts: (category: string, search?: string) =>
    `parts:${category}:${search || 'all'}`,

  tires: (make: string, model: string, year: number, season?: string) =>
    `tires:${make}:${model}:${year}:${season || 'all'}`,

  valuation: (make: string, model: string, year: number, mileage: number) =>
    `valuation:${make}:${model}:${year}:${mileage}`,

  modifications: (make: string, model: string, category?: string) =>
    `modifications:${make}:${model}:${category || 'all'}`
};

/**
 * Cache TTL constants (in milliseconds)
 */
export const CACHE_TTL = {
  VERY_SHORT: 5 * 60 * 1000, // 5 minutes
  SHORT: 30 * 60 * 1000, // 30 minutes
  MEDIUM: 2 * 60 * 60 * 1000, // 2 hours
  LONG: 24 * 60 * 60 * 1000, // 1 day
  VERY_LONG: 7 * 24 * 60 * 60 * 1000 // 1 week
};

/**
 * Middleware to add caching to responses
 */
export function cacheResponse(ttlMs: number = CACHE_TTL.MEDIUM) {
  return (req: any, res: any, next: any) => {
    const originalJson = res.json;

    res.json = function (data: any) {
      // Set cache headers
      res.set('Cache-Control', `public, max-age=${Math.floor(ttlMs / 1000)}`);
      res.set('X-Cache', 'application/json');

      return originalJson.call(this, data);
    };

    next();
  };
}
