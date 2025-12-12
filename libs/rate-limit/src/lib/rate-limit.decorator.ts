import { SetMetadata } from '@nestjs/common';
import { RateLimitOptions } from './rate-limit.types';

/**
 * Decorator to apply rate limiting to a route or controller
 * 
 * @example
 * ```typescript
 * // Apply to a single route
 * @RateLimit({ windowSec: 60, max: 10 })
 * @Get('search')
 * search() {
 *   // This route is limited to 10 requests per minute
 * }
 * 
 * // Apply to an entire controller
 * @RateLimit({ windowSec: 60, max: 100 })
 * @Controller('vehicles')
 * export class VehiclesController {
 *   // All routes in this controller share the same rate limit
 * }
 * 
 * // Disable rate limiting for a specific route
 * @RateLimit(null)
 * @Get('health')
 * health() {
 *   // This route is not rate limited
 * }
 * ```
 */
export const RateLimit = (options: Partial<RateLimitOptions> | null) =>
    SetMetadata('rateLimit', options);

/**
 * Pre-configured rate limit presets for common use cases
 */
export const RateLimitPresets = {
    /**
     * Strict rate limit for sensitive operations
     * 5 requests per minute
     */
    Strict: () => RateLimit({ windowSec: 60, max: 5 }),

    /**
     * Moderate rate limit for general API usage
     * 30 requests per minute
     */
    Moderate: () => RateLimit({ windowSec: 60, max: 30 }),

    /**
     * Relaxed rate limit for public endpoints
     * 100 requests per minute
     */
    Relaxed: () => RateLimit({ windowSec: 60, max: 100 }),

    /**
     * Per-hour rate limit for heavy operations
     * 100 requests per hour
     */
    Hourly: () => RateLimit({ windowSec: 3600, max: 100 }),

    /**
     * Authentication rate limit
     * 5 requests per 15 minutes
     */
    Auth: () => RateLimit({ windowSec: 900, max: 5 }),

    /**
     * Disable rate limiting
     */
    Disabled: () => RateLimit(null),
};
