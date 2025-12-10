import { createZodDto } from 'nestjs-zod';
import {
    addToWatchlistSchema,
    updateWatchlistSchema,
    type AddToWatchlistInput,
    type UpdateWatchlistInput,
} from '@vehicle-watchlist/utils';

// DTOs
export class AddToWatchlistDto extends createZodDto(addToWatchlistSchema) { }
export class UpdateWatchlistDto extends createZodDto(updateWatchlistSchema) { }

// Re-export types for convenience
export type { AddToWatchlistInput, UpdateWatchlistInput };
