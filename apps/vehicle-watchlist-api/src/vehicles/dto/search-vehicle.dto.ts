import { createZodDto } from 'nestjs-zod';
import { searchVehicleSchema } from '@vehicle-watchlist/utils';

export class SearchVehicleDto extends createZodDto(searchVehicleSchema) { }
