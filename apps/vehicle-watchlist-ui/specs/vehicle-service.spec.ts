import { VehicleService } from '../src/lib/vehicle-service';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('VehicleService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockFetch.mockReset();
    });

    describe('searchByPlate', () => {
        it('should return vehicles on successful search', async () => {
            const mockVehicle = {
                id: 1,
                licensePlate: '8689365',
                manufacturer: 'פורד גרמניה',
                model: 'DA3',
                commercialName: 'FOCUS',
                year: 2009,
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    success: true,
                    data: [mockVehicle],
                    total: 1,
                }),
            });

            const result = await VehicleService.searchByPlate('8689365');

            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(1);
            expect(result.data[0].licensePlate).toBe('8689365');
        });

        it('should return error on failed search', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: () => Promise.resolve({
                    message: 'Invalid license plate',
                }),
            });

            const result = await VehicleService.searchByPlate('123');

            expect(result.success).toBe(false);
            expect(result.error).toBe('Invalid license plate');
        });

        it('should handle network errors', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            const result = await VehicleService.searchByPlate('8689365');

            expect(result.success).toBe(false);
            expect(result.error).toBe('Network error');
        });
    });
});
