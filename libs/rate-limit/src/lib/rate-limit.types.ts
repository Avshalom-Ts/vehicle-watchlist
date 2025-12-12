import { Request } from 'express';

/**
 * Rate limit configuration options
 */
export interface RateLimitOptions {
    /**
     * Time window in seconds
     * @default 60
     */
    windowSec: number;

    /**
     * Maximum number of requests allowed in the time window
     * @default 100
     */
    max: number;

    /**
     * Message to return when rate limit is exceeded
     * @default 'Too many requests, please try again later.'
     */
    message?: string;

    /**
     * Status code to return when rate limit is exceeded
     * @default 429
     */
    statusCode?: number;

    /**
     * Skip rate limiting based on request (e.g., skip for certain IPs)
     */
    skip?: (req: Request) => boolean;

    /**
     * Custom key generator for rate limiting
     * @default Uses IP address
     */
    keyGenerator?: (req: Request) => string;
}

/**
 * Rate limit info stored for each key
 */
export interface RateLimitInfo {
    /**
     * Number of requests made in the current window
     */
    count: number;

    /**
     * Timestamp when the current window started
     */
    resetTime: number;
}

/**
 * Storage interface for rate limit data
 */
export interface RateLimitStorage {
    /**
     * Get rate limit info for a key
     */
    get(key: string): Promise<RateLimitInfo | null>;

    /**
     * Set rate limit info for a key
     */
    set(key: string, info: RateLimitInfo, ttl: number): Promise<void>;

    /**
     * Increment the count for a key
     */
    increment(key: string): Promise<number>;

    /**
     * Delete rate limit info for a key
     */
    delete(key: string): Promise<void>;

    /**
     * Clear all rate limit data
     */
    clear(): Promise<void>;
}

/**
 * Rate limit response headers
 */
export interface RateLimitHeaders {
    'X-RateLimit-Limit': number;
    'X-RateLimit-Remaining': number;
    'X-RateLimit-Reset': number;
    'Retry-After'?: number;
}

/**
 * Module configuration options
 */
export interface RateLimitModuleOptions extends RateLimitOptions {
    /**
     * Custom storage implementation
     */
    storage?: RateLimitStorage;
}
