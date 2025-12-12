/**
 * Injection token for rate limit options
 */
export const RATE_LIMIT_OPTIONS = 'RATE_LIMIT_OPTIONS';

/**
 * Injection token for rate limit storage
 */
export const RATE_LIMIT_STORAGE = 'RATE_LIMIT_STORAGE';

/**
 * Default rate limit options
 */
export const DEFAULT_RATE_LIMIT_OPTIONS = {
    windowSec: 60, // 1 minute
    max: 100, // 100 requests per minute
    message: 'Too many requests, please try again later.',
    statusCode: 429,
};
