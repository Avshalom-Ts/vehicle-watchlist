import { WatchlistService } from '../src/lib/watchlist-service';
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

describe('WatchlistService', () => {
    const mockToken = 'mock-access-token';

    beforeEach(() => {
        jest.clearAllMocks();
        mockFetch.mockReset();
        (AuthService.getAccessToken as jest.Mock).mockReturnValue(mockToken);
    });

    describe('getWatchlist', () => {
        const mockWatchlistItem = {
            _id: '123',
            userId: 'user-1',
            licensePlate: '8689365',
            manufacturer: 'פורד גרמניה',
            model: 'DA3',
            commercialName: 'FOCUS',
            year: 2009,
            color: 'אפור מטל',
            fuelType: 'בנזין',
            ownership: 'פרטי',
            notes: '',
            isStarred: false,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
        };

        it('should fetch watchlist successfully', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    success: true,
                    data: [mockWatchlistItem],
                    total: 1,
                }),
            });

            const result = await WatchlistService.getWatchlist();

            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(1);
            expect(result.data[0].licensePlate).toBe('8689365');
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/watchlist'),
                expect.objectContaining({
                    method: 'GET',
                    credentials: 'include',
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                    }),
                })
            );
        });

        it('should include starredOnly parameter when specified', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    success: true,
                    data: [],
                    total: 0,
                }),
            });

            await WatchlistService.getWatchlist({ starredOnly: true });

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('starredOnly=true'),
                expect.any(Object)
            );
        });

        it('should include pagination parameters', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    success: true,
                    data: [],
                    total: 0,
                }),
            });

            await WatchlistService.getWatchlist({ limit: 10, offset: 20 });

            const url = mockFetch.mock.calls[0][0];
            expect(url).toContain('limit=10');
            expect(url).toContain('offset=20');
        });

        it('should throw error on failed request', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: () => Promise.resolve({
                    message: 'Unauthorized',
                }),
            });

            await expect(WatchlistService.getWatchlist()).rejects.toThrow('Unauthorized');
        });
    });

    describe('addToWatchlist', () => {
        const addDto = {
            licensePlate: '8689365',
            manufacturer: 'פורד גרמניה',
            model: 'DA3',
            year: 2009,
        };

        it('should add vehicle to watchlist successfully', async () => {
            const mockResponse = {
                success: true,
                data: { ...addDto, _id: '123', isStarred: false },
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await WatchlistService.addToWatchlist(addDto);

            expect(result.success).toBe(true);
            expect(result.data.licensePlate).toBe('8689365');
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/watchlist'),
                expect.objectContaining({
                    method: 'POST',
                    credentials: 'include',
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                    }),
                    body: JSON.stringify(addDto),
                })
            );
        });

        it('should throw error when vehicle already in watchlist', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: () => Promise.resolve({
                    message: 'Vehicle already in watchlist',
                }),
            });

            await expect(WatchlistService.addToWatchlist(addDto)).rejects.toThrow(
                'Vehicle already in watchlist'
            );
        });
    });

    describe('checkInWatchlist', () => {
        it('should return true when vehicle is in watchlist', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    success: true,
                    inWatchlist: true,
                    data: { licensePlate: '8689365' },
                }),
            });

            const result = await WatchlistService.checkInWatchlist('8689365');

            expect(result.inWatchlist).toBe(true);
            expect(result.data).toBeTruthy();
        });

        it('should return false when vehicle is not in watchlist', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    success: true,
                    inWatchlist: false,
                    data: null,
                }),
            });

            const result = await WatchlistService.checkInWatchlist('9999999');

            expect(result.inWatchlist).toBe(false);
            expect(result.data).toBeNull();
        });

        it('should encode license plate in URL', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    success: true,
                    inWatchlist: false,
                    data: null,
                }),
            });

            await WatchlistService.checkInWatchlist('12-345-67');

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/watchlist/12-345-67'),
                expect.any(Object)
            );
        });
    });

    describe('updateWatchlistItem', () => {
        it('should update notes successfully', async () => {
            const mockResponse = {
                success: true,
                data: { licensePlate: '8689365', notes: 'Test notes' },
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await WatchlistService.updateWatchlistItem('8689365', {
                notes: 'Test notes',
            });

            expect(result.success).toBe(true);
            expect(result.data.notes).toBe('Test notes');
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/watchlist/8689365'),
                expect.objectContaining({
                    method: 'PATCH',
                    body: JSON.stringify({ notes: 'Test notes' }),
                })
            );
        });

        it('should toggle star status', async () => {
            const mockResponse = {
                success: true,
                data: { licensePlate: '8689365', isStarred: true },
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await WatchlistService.updateWatchlistItem('8689365', {
                isStarred: true,
            });

            expect(result.data.isStarred).toBe(true);
        });
    });

    describe('removeFromWatchlist', () => {
        it('should remove vehicle from watchlist', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ success: true }),
            });

            const result = await WatchlistService.removeFromWatchlist('8689365');

            expect(result.success).toBe(true);
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/watchlist/8689365'),
                expect.objectContaining({
                    method: 'DELETE',
                })
            );
        });

        it('should throw error when vehicle not found', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: () => Promise.resolve({
                    message: 'Vehicle not found in watchlist',
                }),
            });

            await expect(WatchlistService.removeFromWatchlist('9999999')).rejects.toThrow(
                'Vehicle not found in watchlist'
            );
        });
    });

    describe('getWatchlistCount', () => {
        it('should return total count', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    success: true,
                    data: [],
                    total: 15,
                }),
            });

            const count = await WatchlistService.getWatchlistCount();

            expect(count).toBe(15);
        });

        it('should return 0 on error', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            const count = await WatchlistService.getWatchlistCount();

            expect(count).toBe(0);
        });
    });

    describe('getStarredCount', () => {
        it('should return starred count', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    success: true,
                    data: [],
                    total: 5,
                }),
            });

            const count = await WatchlistService.getStarredCount();

            expect(count).toBe(5);
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('starredOnly=true'),
                expect.any(Object)
            );
        });

        it('should return 0 on error', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            const count = await WatchlistService.getStarredCount();

            expect(count).toBe(0);
        });
    });

    describe('without auth token', () => {
        it('should not include Authorization header when no token', async () => {
            (AuthService.getAccessToken as jest.Mock).mockReturnValue(null);

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    success: true,
                    data: [],
                    total: 0,
                }),
            });

            await WatchlistService.getWatchlist();

            const headers = mockFetch.mock.calls[0][1].headers;
            expect(headers.Authorization).toBeUndefined();
        });
    });
});
