import {
    Controller,
    Get,
    Query,
    Param,
    BadRequestException,
    HttpCode,
    HttpStatus,
    NotFoundException,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { SearchVehicleDto, FilterVehiclesDto } from './dto';
import { RateLimit, RateLimitPresets } from '@vehicle-watchlist/rate-limit';

@Controller('vehicles')
export class VehiclesController {
    constructor(private readonly vehiclesService: VehiclesService) { }

    /**
     * Search for a vehicle by license plate (PUBLIC)
     * GET /vehicles/search?plate=8689365
     * Returns single exact match (no pagination needed)
     */
    @Get('search')
    @RateLimitPresets.Moderate() // 30 requests per minute
    @HttpCode(HttpStatus.OK)
    async search(@Query() query: SearchVehicleDto) {
        const result = await this.vehiclesService.searchByPlate(query.plate);

        if (!result.success) {
            throw new BadRequestException(result.error || 'Failed to search vehicle');
        }

        return {
            success: true,
            data: result.vehicles,
            total: result.total,
        };
    }

    /**
     * Search for vehicles with filters (must be before :plate route)
     * GET /vehicles/filter?manufacturer=Toyota&yearFrom=2020&page=1&limit=25
     */
    @Get('filter')
    @RateLimitPresets.Moderate() // 30 requests per minute
    @HttpCode(HttpStatus.OK)
    async searchWithFilters(@Query() query: FilterVehiclesDto) {
        const filters = {
            manufacturer: query.manufacturer,
            model: query.model,
            yearFrom: query.yearFrom,
            yearTo: query.yearTo,
            color: query.color,
            fuelType: query.fuelType,
            ownership: query.ownership,
        };

        // Remove undefined values
        Object.keys(filters).forEach(key => {
            if (filters[key as keyof typeof filters] === undefined) {
                delete filters[key as keyof typeof filters];
            }
        });

        // Validate at least one filter is provided
        if (Object.keys(filters).length === 0) {
            throw new BadRequestException('At least one filter is required (manufacturer, model, yearFrom, yearTo, color, fuelType, or ownership)');
        }

        const page = query.page || 1;
        const limit = query.limit || 25;
        const offset = (page - 1) * limit;

        const result = await this.vehiclesService.searchWithFilters(filters, {
            limit,
            offset,
        });

        if (!result.success) {
            throw new BadRequestException(result.error || 'Failed to search vehicles');
        }

        const totalPages = Math.ceil(result.total / limit);

        return {
            success: true,
            data: result.vehicles,
            total: result.total,
            pagination: {
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };
    }

    /**
     * Get extended vehicle details by license plate (PUBLIC)
     * GET /vehicles/:plate/details
     */
    @Get(':plate/details')
    @HttpCode(HttpStatus.OK)
    async getExtendedDetails(@Param('plate') plate: string) {
        const result = await this.vehiclesService.getExtendedDetails(plate);

        if (!result.success) {
            throw new BadRequestException(result.error || 'Failed to get vehicle details');
        }

        if (!result.details) {
            throw new NotFoundException('Vehicle not found');
        }

        return {
            success: true,
            data: result.details,
        };
    }
}
