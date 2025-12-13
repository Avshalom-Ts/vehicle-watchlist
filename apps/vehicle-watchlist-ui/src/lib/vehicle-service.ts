// Use relative URL so it works on any domain (localhost, CodeSandbox, production)
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface Vehicle {
    id: number;
    licensePlate: string;
    manufacturer: string;
    manufacturerCode: number;
    model: string;
    modelCode: number;
    modelType: string;
    commercialName: string;
    year: number;
    color: string;
    colorCode: number;
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
    registrationInstruction: number | null;
    firstOnRoad: string | null;
}

export interface ExtendedVehicleDetails {
    id: number;
    licensePlate: string;
    manufacturerCode: number;
    modelCode: number;
    modelType: string;
    frontTireLoadCode: number | null;
    rearTireLoadCode: number | null;
    frontTireSpeedCode: string | null;
    rearTireSpeedCode: string | null;
    towingInfo: string | null;
}

export interface PaginationInfo {
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface VehicleSearchResult {
    success: boolean;
    data: Vehicle[];
    total: number;
    pagination?: PaginationInfo;
    error?: string;
}

export interface ExtendedDetailsResult {
    success: boolean;
    data: ExtendedVehicleDetails | null;
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
    page?: number;
    limit?: number;
}

export interface AiSearchResult extends VehicleSearchResult {
    parsedPrompt?: {
        confidence: number;
        extractedFilters: VehicleFilters;
        extractedEntities?: any[];
        suggestions?: string[];
    };
}

export class VehicleService {
    /**
     * Search vehicles using AI-powered natural language (public endpoint)
     * Supports Hebrew and English prompts
     */
    static async searchWithAI(
        prompt: string,
        options: { page?: number; limit?: number } = {}
    ): Promise<AiSearchResult> {
        try {
            const response = await fetch(`${API_URL}/ai-search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt,
                    page: options.page || 1,
                    limit: options.limit || 25,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    data: [],
                    total: 0,
                    error: data.error || 'AI search failed',
                    parsedPrompt: data.parsedPrompt,
                };
            }

            return {
                success: true,
                data: data.data || [],
                total: data.total || 0,
                pagination: data.pagination,
                parsedPrompt: data.parsedPrompt,
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
     * Search for vehicles by license plate (public endpoint)
     */
    static async searchByPlate(
        plate: string,
        options: { page?: number; limit?: number } = {}
    ): Promise<VehicleSearchResult> {
        try {
            const params = new URLSearchParams();
            params.set('plate', plate);
            if (options.page) params.set('page', options.page.toString());
            if (options.limit) params.set('limit', options.limit.toString());

            const response = await fetch(
                `${API_URL}/vehicles/search?${params.toString()}`,
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
                pagination: data.pagination,
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
            if (filters.page) params.set('page', filters.page.toString());
            if (filters.limit) params.set('limit', filters.limit.toString());

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
                pagination: data.pagination,
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
     * Get extended vehicle details (tire codes, model codes, etc.)
     */
    static async getExtendedDetails(licensePlate: string): Promise<ExtendedDetailsResult> {
        try {
            const response = await fetch(
                `${API_URL}/vehicles/${encodeURIComponent(licensePlate)}/details`,
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
                    data: null,
                    error: data.message || 'Failed to get vehicle details',
                };
            }

            return {
                success: true,
                data: data.data || null,
            };
        } catch (error) {
            return {
                success: false,
                data: null,
                error: error instanceof Error ? error.message : 'Network error',
            };
        }
    }
}
