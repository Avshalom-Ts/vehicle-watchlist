import { z } from 'zod';

// Schema for creating a vehicle note
export const createVehicleNoteSchema = z.object({
    watchlistItemId: z.string().min(1, 'Watchlist item ID is required'),
    content: z.string().min(1, 'Note content is required').max(1000, 'Note cannot exceed 1000 characters'),
});

// Schema for updating a vehicle note
export const updateVehicleNoteSchema = z.object({
    content: z.string().min(1, 'Note content is required').max(1000, 'Note cannot exceed 1000 characters'),
});

// Vehicle note response schema
export const vehicleNoteSchema = z.object({
    id: z.string(),
    watchlistItemId: z.string(),
    userId: z.string(),
    content: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

// Type exports
export type CreateVehicleNoteInput = z.infer<typeof createVehicleNoteSchema>;
export type UpdateVehicleNoteInput = z.infer<typeof updateVehicleNoteSchema>;
export type VehicleNote = z.infer<typeof vehicleNoteSchema>;
