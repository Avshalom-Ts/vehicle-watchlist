import { AuthService } from './auth-service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

export interface AnalyticsData {
    totalVehicles: number;
    starredCount: number;
    byManufacturer: Array<{ _id: string; count: number }>;
    byYear: Array<{ _id: number; count: number }>;
    byFuelType: Array<{ _id: string; count: number }>;
    byColor: Array<{ _id: string; count: number }>;
    recentlyAdded: Array<{
        licensePlate: string;
        manufacturer: string;
        model: string;
        createdAt: string;
    }>;
    averageYear: number;
    oldestVehicle: { year: number; manufacturer: string; model: string } | null;
    newestVehicle: { year: number; manufacturer: string; model: string } | null;
}

export class AnalyticsService {
    private static getAuthHeaders(): HeadersInit {
        const token = AuthService.getAccessToken();
        return {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
    }

    /**
     * Get watchlist analytics
     */
    static async getAnalytics(): Promise<{ success: boolean; data: AnalyticsData | null; error?: string }> {
        try {
            const response = await fetch(`${API_URL}/watchlist/analytics`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                return {
                    success: false,
                    data: null,
                    error: error.message || 'Failed to fetch analytics',
                };
            }

            const result = await response.json();
            return {
                success: true,
                data: result.data,
            };
        } catch {
            return {
                success: false,
                data: null,
                error: 'Network error. Please try again.',
            };
        }
    }
}
