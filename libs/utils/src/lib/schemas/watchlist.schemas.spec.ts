import {
    addToWatchlistSchema,
    updateWatchlistSchema,
    watchlistItemSchema,
} from './watchlist.schemas';

describe('Watchlist Schemas', () => {
    describe('addToWatchlistSchema', () => {
        it('should validate complete input', () => {
            const input = {
                licensePlate: '1234567',
                manufacturer: 'Toyota',
                model: 'Corolla',
                commercialName: 'Corolla LE',
                year: 2020,
                color: 'White',
                fuelType: 'Gasoline',
                ownership: 'Private',
                notes: 'My car',
                isStarred: true,
            };

            const result = addToWatchlistSchema.safeParse(input);
            expect(result.success).toBe(true);
        });

        it('should validate minimal required fields', () => {
            const input = {
                licensePlate: '1234567',
                manufacturer: 'Toyota',
                model: 'Corolla',
                year: 2020,
            };

            const result = addToWatchlistSchema.safeParse(input);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.isStarred).toBe(false); // default
            }
        });

        it('should validate license plate with dashes', () => {
            const input = {
                licensePlate: '12-345-67',
                manufacturer: 'Toyota',
                model: 'Corolla',
                year: 2020,
            };

            const result = addToWatchlistSchema.safeParse(input);
            expect(result.success).toBe(true);
        });

        it('should reject invalid license plate', () => {
            const input = {
                licensePlate: 'invalid',
                manufacturer: 'Toyota',
                model: 'Corolla',
                year: 2020,
            };

            const result = addToWatchlistSchema.safeParse(input);
            expect(result.success).toBe(false);
        });

        it('should reject empty manufacturer', () => {
            const input = {
                licensePlate: '1234567',
                manufacturer: '',
                model: 'Corolla',
                year: 2020,
            };

            const result = addToWatchlistSchema.safeParse(input);
            expect(result.success).toBe(false);
        });

        it('should reject empty model', () => {
            const input = {
                licensePlate: '1234567',
                manufacturer: 'Toyota',
                model: '',
                year: 2020,
            };

            const result = addToWatchlistSchema.safeParse(input);
            expect(result.success).toBe(false);
        });

        it('should reject year before 1900', () => {
            const input = {
                licensePlate: '1234567',
                manufacturer: 'Toyota',
                model: 'Corolla',
                year: 1800,
            };

            const result = addToWatchlistSchema.safeParse(input);
            expect(result.success).toBe(false);
        });

        it('should reject year after 2100', () => {
            const input = {
                licensePlate: '1234567',
                manufacturer: 'Toyota',
                model: 'Corolla',
                year: 2200,
            };

            const result = addToWatchlistSchema.safeParse(input);
            expect(result.success).toBe(false);
        });

        it('should accept watchlist item without notes', () => {
            const input = {
                licensePlate: '1234567',
                manufacturer: 'Toyota',
                model: 'Corolla',
                year: 2020,
            };

            const result = addToWatchlistSchema.safeParse(input);
            expect(result.success).toBe(true);
        });

        it('should accept watchlist item with isStarred', () => {
            const input = {
                licensePlate: '1234567',
                manufacturer: 'Toyota',
                model: 'Corolla',
                year: 2020,
                isStarred: true,
            };

            const result = addToWatchlistSchema.safeParse(input);
            expect(result.success).toBe(true);
        });
    });

    describe('updateWatchlistSchema', () => {
        it('should validate empty update (no fields)', () => {
            const result = updateWatchlistSchema.safeParse({});
            expect(result.success).toBe(true);
        });

        it('should validate isStarred update to true', () => {
            const result = updateWatchlistSchema.safeParse({ isStarred: true });
            expect(result.success).toBe(true);
        });

        it('should validate isStarred update to false', () => {
            const result = updateWatchlistSchema.safeParse({ isStarred: false });
            expect(result.success).toBe(true);
        });

        it('should reject non-boolean isStarred', () => {
            const result = updateWatchlistSchema.safeParse({
                isStarred: 'yes',
            });
            expect(result.success).toBe(false);
        });
    });

    describe('watchlistItemSchema', () => {
        it('should validate complete watchlist item', () => {
            const item = {
                id: '123',
                licensePlate: '1234567',
                manufacturer: 'Toyota',
                model: 'Corolla',
                commercialName: 'Corolla LE',
                year: 2020,
                color: 'White',
                fuelType: 'Gasoline',
                ownership: 'Private',
                notes: 'My car',
                isStarred: true,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-02T00:00:00Z',
            };

            const result = watchlistItemSchema.safeParse(item);
            expect(result.success).toBe(true);
        });

        it('should validate item with optional fields as undefined', () => {
            const item = {
                id: '123',
                licensePlate: '1234567',
                manufacturer: 'Toyota',
                model: 'Corolla',
                year: 2020,
                isStarred: false,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-02T00:00:00Z',
            };

            const result = watchlistItemSchema.safeParse(item);
            expect(result.success).toBe(true);
        });

        it('should reject missing required fields', () => {
            const item = {
                id: '123',
                licensePlate: '1234567',
                // Missing manufacturer, model, year, etc.
            };

            const result = watchlistItemSchema.safeParse(item);
            expect(result.success).toBe(false);
        });

        it('should reject invalid id type', () => {
            const item = {
                id: 123, // Should be string
                licensePlate: '1234567',
                manufacturer: 'Toyota',
                model: 'Corolla',
                year: 2020,
                isStarred: false,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-02T00:00:00Z',
            };

            const result = watchlistItemSchema.safeParse(item);
            expect(result.success).toBe(false);
        });
    });
});
