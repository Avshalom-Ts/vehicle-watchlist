import { Injectable } from '@nestjs/common';
import { RateLimitStorage, RateLimitInfo } from './rate-limit.types';

/**
 * In-memory storage implementation for rate limiting
 * This is suitable for single-instance applications
 * For distributed systems, use Redis storage instead
 */
@Injectable()
export class MemoryRateLimitStorage implements RateLimitStorage {
    private store = new Map<string, RateLimitInfo>();
    private timers = new Map<string, NodeJS.Timeout>();

    async get(key: string): Promise<RateLimitInfo | null> {
        return this.store.get(key) || null;
    }

    async set(key: string, info: RateLimitInfo, ttl: number): Promise<void> {
        this.store.set(key, info);

        // Clear any existing timer
        const existingTimer = this.timers.get(key);
        if (existingTimer) {
            clearTimeout(existingTimer);
        }

        // Set a timer to delete the entry after TTL
        const timer = setTimeout(() => {
            this.store.delete(key);
            this.timers.delete(key);
        }, ttl * 1000);

        this.timers.set(key, timer);
    }

    async increment(key: string): Promise<number> {
        const info = await this.get(key);
        if (info) {
            info.count++;
            await this.set(key, info, 0); // Keep existing TTL
            return info.count;
        }
        return 0;
    }

    async delete(key: string): Promise<void> {
        this.store.delete(key);
        const timer = this.timers.get(key);
        if (timer) {
            clearTimeout(timer);
            this.timers.delete(key);
        }
    }

    async clear(): Promise<void> {
        this.store.clear();
        this.timers.forEach((timer) => clearTimeout(timer));
        this.timers.clear();
    }

    /**
     * Get the size of the store (useful for testing/debugging)
     */
    size(): number {
        return this.store.size;
    }
}
