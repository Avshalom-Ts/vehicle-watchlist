import { createZodDto } from 'nestjs-zod';
import {
    createVehicleNoteSchema,
    updateVehicleNoteSchema,
    type CreateVehicleNoteInput,
    type UpdateVehicleNoteInput,
} from '@vehicle-watchlist/utils';

// DTOs
export class CreateVehicleNoteDto extends createZodDto(createVehicleNoteSchema) { }
export class UpdateVehicleNoteDto extends createZodDto(updateVehicleNoteSchema) { }

// Re-export types for convenience
export type { CreateVehicleNoteInput, UpdateVehicleNoteInput };
