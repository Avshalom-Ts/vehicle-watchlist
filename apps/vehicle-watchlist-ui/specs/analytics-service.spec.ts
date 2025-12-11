import { AnalyticsService } from '../src/lib/analytics-service';
import { AuthService } from '../src/lib/auth-service';

// Mock AuthService
jest.mock('../src/lib/auth-service', () => ({
    AuthService: {
        getAccessToken: jest.fn(),
    },
}));

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('AnalyticsService', () => {
    const mockToken = 'mock-access-token';

    const mockAnalyticsData = {
        totalVehicles: 10,
        starredCount: 3,
        byManufacturer: [
            { _id: 'Toyota', count: 5 },
            { _id: 'Ford', count: 3 },
            { _id: 'BMW', count: 2 },
        ],
        byYear: [
            { _id: 2020, count: 4 },
            { _id: 2019, count: 3 },
            { _id: 2018, count: 3 },
        ],
        byFuelType: [
            { _id: 'בנזין', count: 6 },
            { _id: 'דיזל', count: 3 },
            { _id: 'חשמלי', count: 1 },
        ],
        byColor: [
            { _id: 'לבן', count: 4 },
            { _id: 'שחור', count: 3 },
            { _id: 'אפור', count: 3 },
        ],
        recentlyAdded: [
            {
                licensePlate: '8689365',
                manufacturer: 'Toyota',
                model: 'Corolla',
                createdAt: '2024-01-15T10:00:00.000Z',
            },
        ],
        averageYear: 2019,
        oldestVehicle: { year: 2015, manufacturer: 'Ford', model: 'Focus' },
        newestVehicle: { year: 2023, manufacturer: 'Tesla', model: 'Model 3' },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockFetch.mockReset();
        (AuthService.getAccessToken as jest.Mock).mockReturnValue(mockToken);
    });

    describe('getAnalytics', () => {
        it('should fetch analytics successfully', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    success: true,
                    data: mockAnalyticsData,
                }),
            });

            const result = await AnalyticsService.getAnalytics();

            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockAnalyticsData);
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/watchlist/analytics'),
                expect.objectContaining({
                    method: 'GET',
                    headers: expect.objectContaining({
                        Authorization: `Bearer ${mockToken}`,
                    }),
                })
            );
        });

        it('should return all analytics fields', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    success: true,
                    data: mockAnalyticsData,
                }),
            });

            const result = await AnalyticsService.getAnalytics();

            expect(result.data?.totalVehicles).toBe(10);
            expect(result.data?.starredCount).toBe(3);
            expect(result.data?.byManufacturer).toHaveLength(3);
            expect(result.data?.byYear).toHaveLength(3);
            expect(result.data?.byFuelType).toHaveLength(3);
            expect(result.data?.byColor).toHaveLength(3);
            expect(result.data?.averageYear).toBe(2019);
            expect(result.data?.oldestVehicle).toBeTruthy();
            expect(result.data?.newestVehicle).toBeTruthy();
        });

        it('should return error on failed request', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: () => Promise.resolve({
                    message: 'Unauthorized',
                }),
            });

            const result = await AnalyticsService.getAnalytics();

            expect(result.success).toBe(false);
            expect(result.data).toBeNull();
            expect(result.error).toBe('Unauthorized');
        });

        it('should handle malformed error response', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: () => Promise.reject(new Error('JSON parse error')),
            });

            const result = await AnalyticsService.getAnalytics();

            expect(result.success).toBe(false);
            expect(result.error).toBe('Failed to fetch analytics');
        });

        it('should handle network errors', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            const result = await AnalyticsService.getAnalytics();

            expect(result.success).toBe(false);
            expect(result.data).toBeNull();
            expect(result.error).toBe('Network error. Please try again.');
        });

        it('should include auth header when token exists', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    success: true,
                    data: mockAnalyticsData,
                }),
            });

            await AnalyticsService.getAnalytics();

            const headers = mockFetch.mock.calls[0][1].headers;
            expect(headers.Authorization).toBe(`Bearer ${mockToken}`);
        });

        it('should not include auth header when no token', async () => {
            (AuthService.getAccessToken as jest.Mock).mockReturnValue(null);

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    success: true,
                    data: mockAnalyticsData,
                }),
            });

            await AnalyticsService.getAnalytics();

            const headers = mockFetch.mock.calls[0][1].headers;
            expect(headers.Authorization).toBeUndefined();
        });

        it('should handle empty analytics data', async () => {
            const emptyAnalytics = {
                totalVehicles: 0,
                starredCount: 0,
                byManufacturer: [],
                byYear: [],
                byFuelType: [],
                byColor: [],
                recentlyAdded: [],
                averageYear: 0,
                oldestVehicle: null,
                newestVehicle: null,
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    success: true,
                    data: emptyAnalytics,
                }),
            });

            const result = await AnalyticsService.getAnalytics();

            expect(result.success).toBe(true);
            expect(result.data?.totalVehicles).toBe(0);
            expect(result.data?.byManufacturer).toHaveLength(0);
            expect(result.data?.oldestVehicle).toBeNull();
        });
    });
});
