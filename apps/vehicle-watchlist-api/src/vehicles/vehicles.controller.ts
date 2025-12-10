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
     * Get a single vehicle by license plate
     * GET /vehicles/:plate
     */
    @Get(':plate')
    @HttpCode(HttpStatus.OK)
    async getByPlate(@Query('plate') plate: string) {
        if (!plate) {
            throw new BadRequestException('License plate is required');
        }

        const vehicle = await this.vehiclesService.getByPlate(plate);

        if (!vehicle) {
            return {
                success: false,
                message: 'Vehicle not found',
                data: null,
            };
        }

        return {
            success: true,
            data: vehicle,
        };
    }

    /**
     * Search for vehicles with filters
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
