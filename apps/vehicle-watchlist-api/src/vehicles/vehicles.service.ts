import { Injectable, Logger } from '@nestjs/common';
import { GovIlApiService, Vehicle, VehicleSearchResult, VehicleFilterOptions, ExtendedVehicleSearchResult } from '@vehicle-watchlist/api';

@Injectable()
export class VehiclesService {
    private readonly logger = new Logger(VehiclesService.name);

    constructor(private readonly govIlApiService: GovIlApiService) { }

    /**
     * Search for a vehicle by license plate number
     * Returns single exact match
     */
    async searchByPlate(plate: string): Promise<VehicleSearchResult> {
        this.logger.log(`Searching for vehicle with plate: ${plate}`);

        const result = await this.govIlApiService.searchByLicensePlate(plate);

        if (result.success) {
            this.logger.log(`Found ${result.vehicles.length} vehicle(s) (total: ${result.total})`);
        } else {
            this.logger.warn(`Search failed: ${result.error}`);
        }

        return result;
    }

    /**
     * Search vehicles with filters using full-text search
     * The gov.il API's `q` parameter searches across all text fields
     */
    async searchWithFilters(
        filters: VehicleFilterOptions,
        options: { limit?: number; offset?: number } = {}
    ): Promise<VehicleSearchResult> {
        // Build search query from all text filters
        const searchTerms: string[] = [];

        if (filters.manufacturer) searchTerms.push(filters.manufacturer);
        if (filters.model) searchTerms.push(filters.model);
        if (filters.color) searchTerms.push(filters.color);
        if (filters.fuelType) searchTerms.push(filters.fuelType);
        if (filters.ownership) searchTerms.push(filters.ownership);

        // Combine all search terms into one query string
        const searchQuery = searchTerms.join(' ');

        this.logger.log(`Searching vehicles with query: "${searchQuery}", yearFrom: ${filters.yearFrom}, yearTo: ${filters.yearTo}`);

        let result: VehicleSearchResult;

        if (searchQuery) {
            // Use full-text search for text filters
            result = await this.govIlApiService.searchWithQuery(searchQuery, {
                limit: options.limit || 50, // Get more results for client-side year filtering
                offset: options.offset,
            });
        } else if (filters.yearFrom) {
            // If only year filter, use exact filter on year
            result = await this.govIlApiService.searchWithFilters(
                { shnat_yitzur: filters.yearFrom },
                options
            );
        } else {
            // No filters provided
            return {
                success: false,
                vehicles: [],
                total: 0,
                error: 'At least one search filter is required',
            };
        }

        // Apply year range filter client-side (gov.il API doesn't support range queries)
        if (result.success && (filters.yearFrom || filters.yearTo)) {
            const yearFrom = filters.yearFrom || 0;
            const yearTo = filters.yearTo || 9999;
            result.vehicles = result.vehicles.filter(
                v => v.year >= yearFrom && v.year <= yearTo
            );
            result.total = result.vehicles.length;
        }

        if (result.success) {
            this.logger.log(`Found ${result.vehicles.length} vehicle(s)`);
        } else {
            this.logger.warn(`Search failed: ${result.error}`);
        }

        return result;
    }

    /**
     * Get a single vehicle by license plate
     * Returns the first match or null if not found
     */
    async getByPlate(plate: string): Promise<Vehicle | null> {
        const result = await this.searchByPlate(plate);

        if (result.success && result.vehicles.length > 0) {
            return result.vehicles[0];
        }

        return null;
    }

    /**
     * Get extended vehicle details (tire codes, model codes, etc.)
     */
    async getExtendedDetails(plate: string): Promise<ExtendedVehicleSearchResult> {
        this.logger.log(`Fetching extended details for vehicle: ${plate}`);

        const result = await this.govIlApiService.getExtendedDetails(plate);

        if (result.success && result.details) {
            this.logger.log(`Found extended details for vehicle: ${plate}`);
        } else if (result.success) {
            this.logger.log(`No extended details found for vehicle: ${plate}`);
        } else {
            this.logger.warn(`Failed to fetch extended details: ${result.error}`);
        }

        return result;
    }
}
