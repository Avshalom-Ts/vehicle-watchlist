import { Injectable, Logger } from '@nestjs/common';
import { GovIlApiService, Vehicle, VehicleSearchResult, VehicleFilterOptions } from '@vehicle-watchlist/api';

@Injectable()
export class VehiclesService {
    private readonly logger = new Logger(VehiclesService.name);

    constructor(private readonly govIlApiService: GovIlApiService) { }

    /**
     * Search for a vehicle by license plate number
     */
    async searchByPlate(plate: string): Promise<VehicleSearchResult> {
        this.logger.log(`Searching for vehicle with plate: ${plate}`);

        const result = await this.govIlApiService.searchByLicensePlate(plate);

        if (result.success) {
            this.logger.log(`Found ${result.vehicles.length} vehicle(s)`);
        } else {
            this.logger.warn(`Search failed: ${result.error}`);
        }

        return result;
    }

    /**
     * Search vehicles with filters
     */
    async searchWithFilters(
        filters: VehicleFilterOptions,
        options: { limit?: number; offset?: number } = {}
    ): Promise<VehicleSearchResult> {
        // Map DTO fields to API field names
        const apiFilters: Record<string, string | number> = {};

        if (filters.manufacturer) apiFilters.tozeret_nm = filters.manufacturer;
        if (filters.model) apiFilters.kinuy_mishari = filters.model;
        if (filters.yearFrom) apiFilters.shnat_yitzur = filters.yearFrom; // For exact year or range start
        if (filters.color) apiFilters.tzeva_rechev = filters.color;
        if (filters.fuelType) apiFilters.sug_delek_nm = filters.fuelType;
        if (filters.ownership) apiFilters.baalut = filters.ownership;

        this.logger.log(`Searching vehicles with filters: ${JSON.stringify(apiFilters)}`);

        const result = await this.govIlApiService.searchWithFilters(apiFilters, options);

        // If yearTo is specified, we need to filter results client-side for year range
        if (filters.yearTo && result.success) {
            const yearFrom = filters.yearFrom || 0;
            const yearTo = filters.yearTo;
            result.vehicles = result.vehicles.filter(
                v => v.year >= yearFrom && v.year <= yearTo
            );
        }

        if (result.success) {
            this.logger.log(`Found ${result.vehicles.length} vehicle(s) (total: ${result.total})`);
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
}
