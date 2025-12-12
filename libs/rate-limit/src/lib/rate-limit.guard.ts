import {
    Injectable,
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { RateLimitOptions, RateLimitStorage } from './rate-limit.types';
import { RATE_LIMIT_OPTIONS, RATE_LIMIT_STORAGE } from './rate-limit.constants';

@Injectable()
export class RateLimitGuard implements CanActivate {
    constructor(
        @Inject(RATE_LIMIT_OPTIONS) private defaultOptions: RateLimitOptions,
        @Inject(RATE_LIMIT_STORAGE) private storage: RateLimitStorage,
        private reflector: Reflector
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const response = context.switchToHttp().getResponse<Response>();

        // Get route-specific options from metadata (set by decorator)
        const routeOptions = this.reflector.getAllAndOverride<
            Partial<RateLimitOptions> | undefined
        >('rateLimit', [context.getHandler(), context.getClass()]);

        // Skip if explicitly disabled
        if (routeOptions === null) {
            return true;
        }

        // Merge options
        const options: RateLimitOptions = {
            ...this.defaultOptions,
            ...routeOptions,
        };

        // Check if we should skip this request
        if (options.skip && options.skip(request)) {
            return true;
        }

        // Generate key for this request
        const key = this.generateKey(request, options);

        // Get current rate limit info
        const now = Math.floor(Date.now() / 1000);
        let info = await this.storage.get(key);

        // Initialize or reset if window has passed
        if (!info || now >= info.resetTime) {
            info = {
                count: 0,
                resetTime: now + options.windowSec,
            };
        }

        // Increment count
        info.count++;

        // Check if limit exceeded
        const isExceeded = info.count > options.max;

        // Save updated info
        const ttl = info.resetTime - now;
        await this.storage.set(key, info, ttl);

        // Set rate limit headers
        this.setHeaders(response, options, info, isExceeded);

        // Throw error if limit exceeded
        if (isExceeded) {
            const message =
                options.message || 'Too many requests, please try again later.';
            const statusCode = options.statusCode || HttpStatus.TOO_MANY_REQUESTS;

            throw new HttpException(
                {
                    statusCode,
                    message,
                    error: 'Too Many Requests',
                },
                statusCode
            );
        }

        return true;
    }

    private generateKey(request: Request, options: RateLimitOptions): string {
        if (options.keyGenerator) {
            return options.keyGenerator(request);
        }

        // Default: use IP address and route
        const ip =
            request.ip ||
            request.headers['x-forwarded-for'] ||
            request.headers['x-real-ip'] ||
            request.socket.remoteAddress ||
            'unknown';

        const route = request.route?.path || request.path;

        return `rate-limit:${ip}:${route}`;
    }

    private setHeaders(
        response: Response,
        options: RateLimitOptions,
        info: { count: number; resetTime: number },
        isExceeded: boolean
    ): void {
        const remaining = Math.max(0, options.max - info.count);
        const resetTime = info.resetTime;

        response.setHeader('X-RateLimit-Limit', options.max);
        response.setHeader('X-RateLimit-Remaining', remaining);
        response.setHeader('X-RateLimit-Reset', resetTime);

        if (isExceeded) {
            const retryAfter = Math.max(0, resetTime - Math.floor(Date.now() / 1000));
            response.setHeader('Retry-After', retryAfter);
        }
    }
}
