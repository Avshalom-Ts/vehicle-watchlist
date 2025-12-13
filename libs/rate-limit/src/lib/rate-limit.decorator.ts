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
 * These are automatically relaxed in non-production environments for testing
 */
export const RateLimitPresets = {
    /**
     * Strict rate limit for sensitive operations
     * Production: 5 requests per minute
     * Test/Dev: 1000 requests per minute
     */
    Strict: () => RateLimit({
        windowSec: 60,
        max: process.env.NODE_ENV === 'production' ? 5 : 1000
    }),

    /**
     * Moderate rate limit for general API usage
     * Production: 30 requests per minute
     * Test/Dev: 1000 requests per minute
     */
    Moderate: () => RateLimit({
        windowSec: 60,
        max: process.env.NODE_ENV === 'production' ? 30 : 1000
    }),

    /**
     * Relaxed rate limit for public endpoints
     * Production: 100 requests per minute
     * Test/Dev: 10000 requests per minute
     */
    Relaxed: () => RateLimit({
        windowSec: 60,
        max: process.env.NODE_ENV === 'production' ? 100 : 10000
    }),

    /**
     * Per-hour rate limit for heavy operations
     * Production: 100 requests per hour
     * Test/Dev: 10000 requests per hour
     */
    Hourly: () => RateLimit({
        windowSec: 3600,
        max: process.env.NODE_ENV === 'production' ? 100 : 10000
    }),

    /**
     * Authentication rate limit
     * Production: 5 requests per 15 minutes
     * Test/Dev: 1000 requests per 15 minutes
     */
    Auth: () => RateLimit({
        windowSec: 900,
        max: process.env.NODE_ENV === 'production' ? 5 : 1000
    }),

    /**
     * Disable rate limiting
     */
    Disabled: () => RateLimit(null),
};
