import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Schema for adding a vehicle to watchlist
export const addToWatchlistSchema = z.object({
    licensePlate: z.string().regex(/^[\d-]{7,10}$/, 'License plate must be 7-8 digits'),
    manufacturer: z.string().min(1, 'Manufacturer is required'),
    model: z.string().min(1, 'Model is required'),
    commercialName: z.string().optional(),
    year: z.number().int().min(1900).max(2100),
    color: z.string().optional(),
    fuelType: z.string().optional(),
    ownership: z.string().optional(),
    notes: z.string().max(500).optional(),
    isStarred: z.boolean().default(false),
});

// Schema for updating watchlist item
export const updateWatchlistSchema = z.object({
    notes: z.string().max(500).optional(),
    isStarred: z.boolean().optional(),
});

// DTOs
export class AddToWatchlistDto extends createZodDto(addToWatchlistSchema) { }
export class UpdateWatchlistDto extends createZodDto(updateWatchlistSchema) { }

// Type exports
export type AddToWatchlistInput = z.infer<typeof addToWatchlistSchema>;
export type UpdateWatchlistInput = z.infer<typeof updateWatchlistSchema>;
