import {
    Controller,
    Get,
    Query,
    BadRequestException,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { SearchVehicleDto, FilterVehiclesDto } from './dto';

@Controller('vehicles')
export class VehiclesController {
    constructor(private readonly vehiclesService: VehiclesService) { }

    /**
     * Search for a vehicle by license plate (PUBLIC)
     * GET /vehicles/search?plate=8689365
     */
    @Get('search')
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
     * GET /vehicles/filter?manufacturer=Toyota&yearFrom=2020
     */
    @Get('filter')
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

        const result = await this.vehiclesService.searchWithFilters(filters, {
            limit: query.limit,
            offset: query.offset,
        });

        if (!result.success) {
            throw new BadRequestException(result.error || 'Failed to search vehicles');
        }

        return {
            success: true,
            data: result.vehicles,
            total: result.total,
        };
    }
}
