const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

export interface Vehicle {
    id: number;
    licensePlate: string;
    manufacturer: string;
    model: string;
    commercialName: string;
    year: number;
    color: string;
    fuelType: string;
    ownership: string;
    lastTestDate: string | null;
    validUntil: string | null;
    chassisNumber: string;
    frontTire: string;
    rearTire: string;
    engineModel: string;
    trimLevel: string;
    pollutionGroup: number | null;
    safetyLevel: number | null;
    firstOnRoad: string | null;
}

export interface VehicleSearchResult {
    success: boolean;
    data: Vehicle[];
    total: number;
    error?: string;
}

export interface VehicleFilters {
    manufacturer?: string;
    model?: string;
    yearFrom?: number;
    yearTo?: number;
    color?: string;
    fuelType?: string;
    ownership?: string;
    limit?: number;
    offset?: number;
}

export class VehicleService {
    /**
     * Search for vehicles by license plate (public endpoint)
     */
    static async searchByPlate(plate: string): Promise<VehicleSearchResult> {
        try {
            const response = await fetch(
                `${API_URL}/vehicles/search?plate=${encodeURIComponent(plate)}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    data: [],
                    total: 0,
                    error: data.message || 'Failed to search vehicle',
                };
            }

            return {
                success: true,
                data: data.data || [],
                total: data.total || 0,
            };
        } catch (error) {
            return {
                success: false,
                data: [],
                total: 0,
                error: error instanceof Error ? error.message : 'Network error',
            };
        }
    }

    /**
     * Search vehicles with filters (public endpoint)
     */
    static async searchWithFilters(filters: VehicleFilters): Promise<VehicleSearchResult> {
        try {
            const params = new URLSearchParams();

            if (filters.manufacturer) params.set('manufacturer', filters.manufacturer);
            if (filters.model) params.set('model', filters.model);
            if (filters.yearFrom) params.set('yearFrom', filters.yearFrom.toString());
            if (filters.yearTo) params.set('yearTo', filters.yearTo.toString());
            if (filters.color) params.set('color', filters.color);
            if (filters.fuelType) params.set('fuelType', filters.fuelType);
            if (filters.ownership) params.set('ownership', filters.ownership);
            if (filters.limit) params.set('limit', filters.limit.toString());
            if (filters.offset) params.set('offset', filters.offset.toString());

            const response = await fetch(
                `${API_URL}/vehicles/filter?${params.toString()}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    data: [],
                    total: 0,
                    error: data.message || 'Failed to search vehicles',
                };
            }

            return {
                success: true,
                data: data.data || [],
                total: data.total || 0,
            };
        } catch (error) {
            return {
                success: false,
                data: [],
                total: 0,
                error: error instanceof Error ? error.message : 'Network error',
            };
        }
    }
}
