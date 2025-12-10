import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { WatchlistController } from './watchlist.controller';
import { WatchlistService } from './watchlist.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Types } from 'mongoose';

describe('WatchlistController', () => {
    let controller: WatchlistController;
    let watchlistService: jest.Mocked<WatchlistService>;

    const mockUserId = new Types.ObjectId().toString();
    const mockRequest = { user: { sub: mockUserId } };

    const mockWatchlistItem = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(mockUserId),
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
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        const mockWatchlistService = {
            addToWatchlist: jest.fn(),
            getWatchlist: jest.fn(),
            getWatchlistItem: jest.fn(),
            updateWatchlistItem: jest.fn(),
            toggleStar: jest.fn(),
            removeFromWatchlist: jest.fn(),
            isInWatchlist: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [WatchlistController],
            providers: [
                {
                    provide: WatchlistService,
                    useValue: mockWatchlistService,
                },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<WatchlistController>(WatchlistController);
        watchlistService = module.get(WatchlistService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('addToWatchlist', () => {
        it('should add a vehicle to watchlist', async () => {
            watchlistService.addToWatchlist.mockResolvedValue(mockWatchlistItem as any);

            const dto = {
                licensePlate: '8689365',
                manufacturer: 'פורד גרמניה',
                model: 'DA3',
                year: 2009,
                isStarred: false,
            };

            const result = await controller.addToWatchlist(mockRequest, dto);

            expect(result.success).toBe(true);
            expect(result.message).toBe('Vehicle added to watchlist');
            expect(result.data).toEqual(mockWatchlistItem);
            expect(watchlistService.addToWatchlist).toHaveBeenCalledWith(mockUserId, dto);
        });

        it('should throw ConflictException when vehicle already in watchlist', async () => {
            watchlistService.addToWatchlist.mockRejectedValue(
                new ConflictException('Vehicle already in watchlist')
            );

            const dto = {
                licensePlate: '8689365',
                manufacturer: 'פורד גרמניה',
                model: 'DA3',
                year: 2009,
                isStarred: false,
            };

            await expect(controller.addToWatchlist(mockRequest, dto)).rejects.toThrow(
                ConflictException
            );
        });
    });

    describe('getWatchlist', () => {
        it('should return user watchlist', async () => {
            watchlistService.getWatchlist.mockResolvedValue({
                items: [mockWatchlistItem] as any,
                total: 1,
            });

            const result = await controller.getWatchlist(mockRequest);

            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(1);
            expect(result.total).toBe(1);
        });

        it('should filter by starred only', async () => {
            watchlistService.getWatchlist.mockResolvedValue({
                items: [],
                total: 0,
            });

            await controller.getWatchlist(mockRequest, 'true');

            expect(watchlistService.getWatchlist).toHaveBeenCalledWith(
                mockUserId,
                expect.objectContaining({ starredOnly: true })
            );
        });
    });

    describe('getWatchlistItem', () => {
        it('should return a watchlist item', async () => {
            watchlistService.getWatchlistItem.mockResolvedValue(mockWatchlistItem as any);

            const result = await controller.getWatchlistItem(mockRequest, '8689365');

            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockWatchlistItem);
            expect(result.inWatchlist).toBe(true);
        });

        it('should return inWatchlist false when not found', async () => {
            watchlistService.getWatchlistItem.mockResolvedValue(null);

            const result = await controller.getWatchlistItem(mockRequest, '9999999');

            expect(result.inWatchlist).toBe(false);
        });
    });

    describe('updateWatchlistItem', () => {
        it('should update a watchlist item', async () => {
            const updatedItem = { ...mockWatchlistItem, notes: 'Test notes' };
            watchlistService.updateWatchlistItem.mockResolvedValue(updatedItem as any);

            const result = await controller.updateWatchlistItem(
                mockRequest,
                '8689365',
                { notes: 'Test notes' }
            );

            expect(result.success).toBe(true);
            expect(result.data.notes).toBe('Test notes');
        });
    });

    describe('toggleStar', () => {
        it('should toggle star status', async () => {
            const starredItem = { ...mockWatchlistItem, isStarred: true };
            watchlistService.toggleStar.mockResolvedValue(starredItem as any);

            const result = await controller.toggleStar(mockRequest, '8689365');

            expect(result.success).toBe(true);
            expect(result.message).toBe('Vehicle starred');
        });
    });

    describe('removeFromWatchlist', () => {
        it('should remove a vehicle from watchlist', async () => {
            watchlistService.removeFromWatchlist.mockResolvedValue(true);

            const result = await controller.removeFromWatchlist(mockRequest, '8689365');

            expect(result.success).toBe(true);
            expect(result.message).toBe('Vehicle removed from watchlist');
        });

        it('should throw NotFoundException when vehicle not found', async () => {
            watchlistService.removeFromWatchlist.mockRejectedValue(
                new NotFoundException('Vehicle not found in watchlist')
            );

            await expect(
                controller.removeFromWatchlist(mockRequest, '9999999')
            ).rejects.toThrow(NotFoundException);
        });
    });
});
