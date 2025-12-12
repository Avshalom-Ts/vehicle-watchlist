import { Module, DynamicModule, Global, Provider, Type } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RateLimitGuard } from './rate-limit.guard';
import { MemoryRateLimitStorage } from './rate-limit.storage';
import { RateLimitOptions, RateLimitStorage } from './rate-limit.types';
import {
    RATE_LIMIT_OPTIONS,
    RATE_LIMIT_STORAGE,
    DEFAULT_RATE_LIMIT_OPTIONS,
} from './rate-limit.constants';

export interface RateLimitModuleOptions {
    /**
     * Global rate limit options
     */
    options?: Partial<RateLimitOptions>;

    /**
     * Custom storage implementation
     * @default MemoryRateLimitStorage
     */
    storage?: RateLimitStorage;

    /**
     * Whether to apply the rate limit guard globally
     * @default true
     */
    global?: boolean;
}

@Global()
@Module({})
export class RateLimitModule {
    /**
     * Register rate limiting with options
     */
    static register(config?: RateLimitModuleOptions): DynamicModule {
        const options: RateLimitOptions = {
            ...DEFAULT_RATE_LIMIT_OPTIONS,
            ...config?.options,
        };

        const providers: Provider[] = [
            {
                provide: RATE_LIMIT_OPTIONS,
                useValue: options,
            },
            {
                provide: RATE_LIMIT_STORAGE,
                useValue: config?.storage || new MemoryRateLimitStorage(),
            },
            RateLimitGuard,
        ];

        // Add global guard if enabled (default: true)
        if (config?.global !== false) {
            providers.push({
                provide: APP_GUARD,
                useClass: RateLimitGuard,
            });
        }

        return {
            module: RateLimitModule,
            providers,
            exports: [RATE_LIMIT_OPTIONS, RATE_LIMIT_STORAGE, RateLimitGuard],
        };
    }

    /**
     * Register rate limiting asynchronously
     */
    static registerAsync(options: {
        useFactory: (...args: unknown[]) => Promise<RateLimitModuleOptions> | RateLimitModuleOptions;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        inject?: (string | symbol | Function | Type<unknown>)[];
    }): DynamicModule {
        const providers: Provider[] = [
            {
                provide: 'RATE_LIMIT_MODULE_OPTIONS',
                useFactory: options.useFactory,
                inject: options.inject || [],
            },
            {
                provide: RATE_LIMIT_OPTIONS,
                useFactory: (config: RateLimitModuleOptions) => ({
                    ...DEFAULT_RATE_LIMIT_OPTIONS,
                    ...config?.options,
                }),
                inject: ['RATE_LIMIT_MODULE_OPTIONS'],
            },
            {
                provide: RATE_LIMIT_STORAGE,
                useFactory: (config: RateLimitModuleOptions) =>
                    config?.storage || new MemoryRateLimitStorage(),
                inject: ['RATE_LIMIT_MODULE_OPTIONS'],
            },
            RateLimitGuard,
            {
                provide: APP_GUARD,
                useClass: RateLimitGuard,
            },
        ];

        return {
            module: RateLimitModule,
            providers,
            exports: [RATE_LIMIT_OPTIONS, RATE_LIMIT_STORAGE, RateLimitGuard],
        };
    }
}
