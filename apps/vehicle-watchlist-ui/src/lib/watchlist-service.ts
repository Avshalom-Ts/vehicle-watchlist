import { AuthService } from './auth-service';
import type { WatchlistItem, AddToWatchlistInput, UpdateWatchlistInput } from '@vehicle-watchlist/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

export interface WatchlistResponse {
    success: boolean;
    data: WatchlistItem[];
    total: number;
}

// Re-export types for convenience
export type { WatchlistItem, AddToWatchlistInput, UpdateWatchlistInput };

export class WatchlistService {
    private static getAuthHeaders(): HeadersInit {
        const token = AuthService.getAccessToken();
        return {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
    }

    private static async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const error = await response.json().catch(() => ({
                message: 'An error occurred',
            }));
            throw new Error(error.message || `HTTP error! status: ${response.status}`);
        }
        return response.json();
    }

    /**
     * Get user's watchlist
     */
    static async getWatchlist(options?: {
        starredOnly?: boolean;
        limit?: number;
        offset?: number;
    }): Promise<{ success: boolean; data: WatchlistItem[]; total: number }> {
        const params = new URLSearchParams();
        if (options?.starredOnly) params.append('starredOnly', 'true');
        if (options?.limit) params.append('limit', options.limit.toString());
        if (options?.offset) params.append('offset', options.offset.toString());

        const queryString = params.toString();
        const url = `${API_URL}/watchlist${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });

        return this.handleResponse<WatchlistResponse>(response);
    }

    /**
     * Add a vehicle to watchlist
     */
    static async addToWatchlist(dto: AddToWatchlistInput): Promise<{ success: boolean; data: WatchlistItem }> {
        const response = await fetch(`${API_URL}/watchlist`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(dto),
        });

        return this.handleResponse(response);
    }

    /**
     * Check if a vehicle is in watchlist
     */
    static async checkInWatchlist(licensePlate: string): Promise<{ success: boolean; inWatchlist: boolean; data: WatchlistItem | null }> {
        const response = await fetch(`${API_URL}/watchlist/${encodeURIComponent(licensePlate)}`, {
            method: 'GET',
            headers: this.getAuthHeaders(),
        });

        return this.handleResponse(response);
    }

    /**
     * Update a watchlist item (notes, starred)
     */
    static async updateWatchlistItem(
        licensePlate: string,
        dto: UpdateWatchlistInput
    ): Promise<{ success: boolean; data: WatchlistItem }> {
        const response = await fetch(`${API_URL}/watchlist/${encodeURIComponent(licensePlate)}`, {
            method: 'PATCH',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(dto),
        });

        return this.handleResponse(response);
    }

    /**
     * Remove a vehicle from watchlist
     */
    static async removeFromWatchlist(licensePlate: string): Promise<{ success: boolean }> {
        const response = await fetch(`${API_URL}/watchlist/${encodeURIComponent(licensePlate)}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders(),
        });

        return this.handleResponse(response);
    }

    /**
     * Get watchlist count (convenience method)
     */
    static async getWatchlistCount(): Promise<number> {
        try {
            const result = await this.getWatchlist({ limit: 1 });
            return result.total;
        } catch {
            return 0;
        }
    }
}
