/**
 * Token bucket rate limiter
 * Prevents excessive API calls and protects external services
 */

interface TokenBucket {
  tokens: number;
  lastRefillTime: number;
}

class RateLimiter {
  private buckets: Map<string, TokenBucket> = new Map();
  private maxTokens: number;
  private refillRate: number; // tokens per second
  private refillInterval: number; // milliseconds

  /**
   * @param maxTokens Maximum tokens in bucket
   * @param refillRate Tokens to add per interval
   * @param refillInterval Interval in milliseconds
   */
  constructor(maxTokens: number = 100, refillRate: number = 10, refillInterval: number = 1000) {
    this.maxTokens = maxTokens;
    this.refillRate = refillRate;
    this.refillInterval = refillInterval;

    // Clean up expired buckets periodically
    setInterval(() => this.cleanup(), 60 * 60 * 1000); // Every hour
  }

  /**
   * Check if a request should be allowed
   * @param identifier Unique identifier for the rate limit bucket (e.g., IP, user ID)
   * @param tokensRequired Number of tokens to consume (default 1)
   * @returns true if request allowed, false if rate limited
   */
  allow(identifier: string, tokensRequired: number = 1): boolean {
    const bucket = this.getOrCreateBucket(identifier);

    // Refill tokens based on time elapsed
    this.refillTokens(bucket);

    // Check if we have enough tokens
    if (bucket.tokens >= tokensRequired) {
      bucket.tokens -= tokensRequired;
      return true;
    }

    return false;
  }

  /**
   * Get bucket or create new one
   */
  private getOrCreateBucket(identifier: string): TokenBucket {
    if (!this.buckets.has(identifier)) {
      this.buckets.set(identifier, {
        tokens: this.maxTokens,
        lastRefillTime: Date.now()
      });
    }

    return this.buckets.get(identifier)!;
  }

  /**
   * Refill tokens based on elapsed time
   */
  private refillTokens(bucket: TokenBucket): void {
    const now = Date.now();
    const elapsedMs = now - bucket.lastRefillTime;
    const elapsedIntervals = elapsedMs / this.refillInterval;
    const tokensToAdd = elapsedIntervals * this.refillRate;

    bucket.tokens = Math.min(bucket.tokens + tokensToAdd, this.maxTokens);
    bucket.lastRefillTime = now;
  }

  /**
   * Get remaining tokens for identifier
   */
  getRemaining(identifier: string): number {
    const bucket = this.getOrCreateBucket(identifier);
    this.refillTokens(bucket);
    return Math.floor(bucket.tokens);
  }

  /**
   * Reset rate limit for identifier
   */
  reset(identifier: string): void {
    this.buckets.delete(identifier);
  }

  /**
   * Reset all rate limits
   */
  resetAll(): void {
    this.buckets.clear();
  }

  /**
   * Clean up old buckets
   */
  private cleanup(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [key, bucket] of this.buckets.entries()) {
      if (now - bucket.lastRefillTime > maxAge) {
        this.buckets.delete(key);
      }
    }
  }

  /**
   * Get bucket count
   */
  size(): number {
    return this.buckets.size;
  }
}

/**
 * Pre-configured rate limiters
 */

// API endpoint rate limiter: 100 requests per minute
export const apiLimiter = new RateLimiter(100, 100, 60 * 1000);

// External API limiter: 10 requests per second
export const externalApiLimiter = new RateLimiter(50, 10, 1000);

// Web scraper limiter: 1 request per 2 seconds
export const scraperLimiter = new RateLimiter(10, 0.5, 1000);

// RockAuto scraper: 1 request per 2 seconds
export const rockAutoLimiter = new RateLimiter(10, 0.5, 1000);

/**
 * Middleware to apply rate limiting
 */
export function rateLimitMiddleware(limiter: RateLimiter, tokensPerRequest: number = 1) {
  return (req: any, res: any, next: any) => {
    const identifier = req.ip || req.connection.remoteAddress || 'unknown';

    if (!limiter.allow(identifier, tokensPerRequest)) {
      const remaining = limiter.getRemaining(identifier);

      return res.status(429).json({
        success: false,
        error: 'Too many requests',
        message: 'You have exceeded the rate limit. Please try again later.',
        retryAfter: 60,
        remaining
      });
    }

    // Add rate limit info to response headers
    res.set('X-RateLimit-Remaining', limiter.getRemaining(identifier).toString());

    next();
  };
}

/**
 * Helper function for rate-limited API calls
 */
export async function withRateLimit<T>(
  identifier: string,
  limiter: RateLimiter,
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    if (limiter.allow(identifier)) {
      return fn();
    }

    if (attempt < maxRetries) {
      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }

  throw new Error('Rate limit exceeded - max retries reached');
}
