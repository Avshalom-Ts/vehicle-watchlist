import { createZodDto } from 'nestjs-zod';
import { filterVehiclesSchema } from '@vehicle-watchlist/utils';

export class FilterVehiclesDto extends createZodDto(filterVehiclesSchema) { }
