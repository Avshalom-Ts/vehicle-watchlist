import { Injectable, Logger, HttpException, HttpStatus, Optional, Inject } from '@nestjs/common';
import {
    GovIlApiResponse,
    GovIlVehicleRecord,
    Vehicle,
    VehicleFilters,
    VehicleSearchOptions,
    VehicleSearchResult,
    GovIlApiConfig,
    DEFAULT_GOV_IL_CONFIG,
    GOV_IL_CONFIG_TOKEN,
} from './gov-il.types';

@Injectable()
export class GovIlApiService {
    private readonly logger = new Logger(GovIlApiService.name);
    private readonly config: GovIlApiConfig;

    constructor(
        @Optional() @Inject(GOV_IL_CONFIG_TOKEN) config?: Partial<GovIlApiConfig>
    ) {
        this.config = { ...DEFAULT_GOV_IL_CONFIG, ...config };
    }

    /**
     * Search for vehicles by license plate number
     */
    async searchByLicensePlate(
        licensePlate: string,
        options: Omit<VehicleSearchOptions, 'licensePlate'> = {}
    ): Promise<VehicleSearchResult> {
        // Validate license plate format (7-8 digits)
        const cleanedPlate = this.cleanLicensePlate(licensePlate);
        if (!this.isValidLicensePlate(cleanedPlate)) {
            return {
                success: false,
                vehicles: [],
                total: 0,
                error: 'Invalid license plate format. Must be 7-8 digits.',
            };
        }

        return this.searchVehicles({ ...options, licensePlate: cleanedPlate });
    }

    /**
     * Search vehicles with exact filters (for Hebrew field values)
     */
    async searchWithFilters(
        filters: Record<string, string | number>,
        options: { limit?: number; offset?: number } = {}
    ): Promise<VehicleSearchResult> {
        return this.searchVehicles({ filters, ...options });
    }

    /**
     * Full-text search across all fields (supports English and Hebrew)
     */
    async searchWithQuery(
        query: string,
        options: { limit?: number; offset?: number } = {}
    ): Promise<VehicleSearchResult> {
        return this.searchVehicles({ searchQuery: query, ...options });
    }

    /**
     * Search vehicles with various options
     */
    async searchVehicles(options: VehicleSearchOptions): Promise<VehicleSearchResult> {
        try {
            const { licensePlate, filters, searchQuery, limit = 10, offset = 0 } = options;

            // Build query URL
            const url = new URL(this.config.baseUrl);
            url.searchParams.set('resource_id', this.config.resourceId);
            url.searchParams.set('limit', limit.toString());
            url.searchParams.set('offset', offset.toString());

            // Build filters object for exact matches (like license plate)
            const queryFilters: Record<string, string | number> = {};

            // Add license plate filter if provided (exact match)
            if (licensePlate) {
                queryFilters.mispar_rechev = licensePlate;
            }

            // Add exact filters if provided
            if (filters) {
                Object.assign(queryFilters, filters);
            }

            // Add filters to URL if any exist
            if (Object.keys(queryFilters).length > 0) {
                url.searchParams.set('filters', JSON.stringify(queryFilters));
            }

            // Add full-text search query if provided (fuzzy search across all fields)
            if (searchQuery) {
                url.searchParams.set('q', searchQuery);
            }

            this.logger.debug(`Fetching from gov.il API: ${url.toString()}`);

            // Make the request with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

            try {
                const response = await fetch(url.toString(), {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                    },
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new HttpException(
                        `Gov.il API returned status ${response.status}`,
                        HttpStatus.BAD_GATEWAY
                    );
                }

                const data: GovIlApiResponse = await response.json();

                if (!data.success || !data.result) {
                    const errorMessage = data.error?.message || 'Unknown API error';
                    this.logger.error(`Gov.il API error: ${errorMessage}`);
                    return {
                        success: false,
                        vehicles: [],
                        total: 0,
                        error: errorMessage,
                    };
                }

                // Transform records to Vehicle objects
                const vehicles = data.result.records.map((record) =>
                    this.transformRecord(record)
                );

                this.logger.debug(`Found ${vehicles.length} vehicles (total: ${data.result.total})`);

                return {
                    success: true,
                    vehicles,
                    total: data.result.total,
                };
            } finally {
                clearTimeout(timeoutId);
            }
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                this.logger.error('Gov.il API request timed out');
                return {
                    success: false,
                    vehicles: [],
                    total: 0,
                    error: 'Request timed out. Please try again.',
                };
            }

            this.logger.error(`Gov.il API request failed: ${error}`);
            return {
                success: false,
                vehicles: [],
                total: 0,
                error: error instanceof Error ? error.message : 'Failed to fetch vehicle data',
            };
        }
    }

    /**
     * Transform raw API record to clean Vehicle object
     */
    private transformRecord(record: GovIlVehicleRecord): Vehicle {
        return {
            id: record._id,
            licensePlate: record.mispar_rechev?.toString() || '',
            manufacturer: record.tozeret_nm || '',
            model: record.degem_nm || '',
            commercialName: record.kinuy_mishari || '',
            year: record.shnat_yitzur || 0,
            color: record.tzeva_rechev || '',
            fuelType: record.sug_delek_nm || '',
            ownership: record.baalut || '',
            lastTestDate: record.mivchan_acharon_dt || null,
            validUntil: record.tokef_dt || null,
            chassisNumber: record.misgeret || '',
            frontTire: record.zmig_kidmi || '',
            rearTire: record.zmig_ahori || '',
            engineModel: record.degem_manoa || '',
            trimLevel: record.ramat_gimur || '',
            pollutionGroup: record.kvutzat_zihum,
            safetyLevel: record.ramat_eivzur_betihuty,
            firstOnRoad: record.moed_aliya_lakvish || null,
        };
    }

    /**
     * Clean license plate - remove dashes, spaces, and non-numeric characters
     */
    private cleanLicensePlate(plate: string): string {
        return plate.replace(/[^0-9]/g, '');
    }

    /**
     * Validate Israeli license plate format (7-8 digits)
     */
    private isValidLicensePlate(plate: string): boolean {
        return /^\d{7,8}$/.test(plate);
    }

    /**
     * Static validation method for use in DTOs
     */
    static isValidLicensePlateFormat(plate: string): boolean {
        const cleaned = plate.replace(/[^0-9]/g, '');
        return /^\d{7,8}$/.test(cleaned);
    }
}
