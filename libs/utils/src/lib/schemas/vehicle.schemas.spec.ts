import {
    licensePlateSchema,
    searchVehicleSchema,
    filterVehiclesSchema,
    vehicleSchema,
    DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE,
} from './vehicle.schemas';

describe('Vehicle Schemas', () => {
    describe('licensePlateSchema', () => {
        it('should validate 7-digit license plate', () => {
            const result = licensePlateSchema.safeParse('1234567');
            expect(result.success).toBe(true);
        });

        it('should validate 8-digit license plate', () => {
            const result = licensePlateSchema.safeParse('12345678');
            expect(result.success).toBe(true);
        });

        it('should validate license plate with dashes', () => {
            const result = licensePlateSchema.safeParse('12-345-67');
            expect(result.success).toBe(true);
        });

        it('should validate license plate with different dash patterns', () => {
            expect(licensePlateSchema.safeParse('123-45-678').success).toBe(true);
            expect(licensePlateSchema.safeParse('12-34-5678').success).toBe(true);
        });

        it('should reject license plate with less than 7 digits', () => {
            const result = licensePlateSchema.safeParse('123456');
            expect(result.success).toBe(false);
        });

        it('should reject license plate with more than 10 characters', () => {
            const result = licensePlateSchema.safeParse('12345678901');
            expect(result.success).toBe(false);
        });

        it('should reject license plate with letters', () => {
            const result = licensePlateSchema.safeParse('ABC1234');
            expect(result.success).toBe(false);
        });

        it('should reject empty string', () => {
            const result = licensePlateSchema.safeParse('');
            expect(result.success).toBe(false);
        });
    });

    describe('searchVehicleSchema', () => {
        it('should validate correct search input', () => {
            const result = searchVehicleSchema.safeParse({ plate: '1234567' });
            expect(result.success).toBe(true);
        });

        it('should validate search with dashes', () => {
            const result = searchVehicleSchema.safeParse({ plate: '12-345-67' });
            expect(result.success).toBe(true);
        });

        it('should reject invalid plate format', () => {
            const result = searchVehicleSchema.safeParse({ plate: 'invalid' });
            expect(result.success).toBe(false);
        });
    });

    describe('filterVehiclesSchema', () => {
        it('should validate empty filters with defaults', () => {
            const result = filterVehiclesSchema.safeParse({});
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.page).toBe(1);
                expect(result.data.limit).toBe(DEFAULT_PAGE_SIZE);
            }
        });

        it('should validate all optional filters', () => {
            const input = {
                manufacturer: 'Toyota',
                model: 'Corolla',
                yearFrom: 2015,
                yearTo: 2023,
                color: 'White',
                fuelType: 'Gasoline',
                ownership: 'Private',
                page: 2,
                limit: 50,
            };

            const result = filterVehiclesSchema.safeParse(input);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual(input);
            }
        });

        it('should coerce string numbers to numbers', () => {
            const input = {
                yearFrom: '2015',
                yearTo: '2023',
                page: '2',
                limit: '50',
            };

            const result = filterVehiclesSchema.safeParse(input);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.yearFrom).toBe(2015);
                expect(result.data.yearTo).toBe(2023);
                expect(result.data.page).toBe(2);
                expect(result.data.limit).toBe(50);
            }
        });

        it('should reject year before 1900', () => {
            const result = filterVehiclesSchema.safeParse({ yearFrom: 1800 });
            expect(result.success).toBe(false);
        });

        it('should reject year after 2100', () => {
            const result = filterVehiclesSchema.safeParse({ yearTo: 2200 });
            expect(result.success).toBe(false);
        });

        it('should reject page less than 1', () => {
            const result = filterVehiclesSchema.safeParse({ page: 0 });
            expect(result.success).toBe(false);
        });

        it('should reject limit greater than MAX_PAGE_SIZE', () => {
            const result = filterVehiclesSchema.safeParse({ limit: MAX_PAGE_SIZE + 1 });
            expect(result.success).toBe(false);
        });

        it('should reject limit less than 1', () => {
            const result = filterVehiclesSchema.safeParse({ limit: 0 });
            expect(result.success).toBe(false);
        });
    });

    describe('vehicleSchema', () => {
        it('should validate complete vehicle object', () => {
            const vehicle = {
                id: 1,
                licensePlate: '1234567',
                manufacturer: 'Toyota',
                model: 'Corolla',
                commercialName: 'Corolla LE',
                year: 2020,
                color: 'White',
                fuelType: 'Gasoline',
                ownership: 'Private',
                lastTestDate: '2024-01-15',
                validUntil: '2025-01-15',
                chassisNumber: 'ABC123XYZ',
                frontTire: '205/55R16',
                rearTire: '205/55R16',
                engineModel: '2ZR-FE',
                trimLevel: 'LE',
                pollutionGroup: 5,
                safetyLevel: 7,
                firstOnRoad: '2020-06',
            };

            const result = vehicleSchema.safeParse(vehicle);
            expect(result.success).toBe(true);
        });

        it('should accept null values for nullable fields', () => {
            const vehicle = {
                id: 1,
                licensePlate: '1234567',
                manufacturer: 'Toyota',
                model: 'Corolla',
                commercialName: 'Corolla',
                year: 2020,
                color: 'White',
                fuelType: 'Gasoline',
                ownership: 'Private',
                lastTestDate: null,
                validUntil: null,
                chassisNumber: null,
                frontTire: null,
                rearTire: null,
                engineModel: null,
                trimLevel: null,
                pollutionGroup: null,
                safetyLevel: null,
                firstOnRoad: null,
            };

            const result = vehicleSchema.safeParse(vehicle);
            expect(result.success).toBe(true);
        });

        it('should reject missing required fields', () => {
            const vehicle = {
                id: 1,
                licensePlate: '1234567',
                // Missing manufacturer, model, etc.
            };

            const result = vehicleSchema.safeParse(vehicle);
            expect(result.success).toBe(false);
        });

        it('should reject invalid year type', () => {
            const vehicle = {
                id: 1,
                licensePlate: '1234567',
                manufacturer: 'Toyota',
                model: 'Corolla',
                commercialName: 'Corolla',
                year: 'not-a-number',
                color: 'White',
                fuelType: 'Gasoline',
                ownership: 'Private',
                lastTestDate: null,
                validUntil: null,
                chassisNumber: null,
                frontTire: null,
                rearTire: null,
                engineModel: null,
                trimLevel: null,
                pollutionGroup: null,
                safetyLevel: null,
                firstOnRoad: null,
            };

            const result = vehicleSchema.safeParse(vehicle);
            expect(result.success).toBe(false);
        });
    });

    describe('Constants', () => {
        it('should have correct default page size', () => {
            expect(DEFAULT_PAGE_SIZE).toBe(25);
        });

        it('should have correct max page size', () => {
            expect(MAX_PAGE_SIZE).toBe(100);
        });
    });
});
