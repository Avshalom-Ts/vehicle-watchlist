import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { WatchlistService } from './watchlist.service';
import { WatchlistItem, WatchlistItemDocument } from '@vehicle-watchlist/database';

describe('WatchlistService', () => {
    let service: WatchlistService;
    let model: Model<WatchlistItemDocument>;

    const mockUserId = new Types.ObjectId().toString();
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
        save: jest.fn().mockResolvedValue(this),
    };

    const mockModel = {
        new: jest.fn(),
        constructor: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        findOneAndUpdate: jest.fn(),
        countDocuments: jest.fn(),
        deleteOne: jest.fn(),
        create: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WatchlistService,
                {
                    provide: getModelToken(WatchlistItem.name),
                    useValue: mockModel,
                },
            ],
        }).compile();

        service = module.get<WatchlistService>(WatchlistService);
        model = module.get<Model<WatchlistItemDocument>>(getModelToken(WatchlistItem.name));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getWatchlist', () => {
        it('should return watchlist items for a user', async () => {
            const mockItems = [mockWatchlistItem];
            mockModel.find.mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    skip: jest.fn().mockReturnValue({
                        limit: jest.fn().mockReturnValue({
                            exec: jest.fn().mockResolvedValue(mockItems),
                        }),
                    }),
                }),
            });
            mockModel.countDocuments.mockReturnValue({
                exec: jest.fn().mockResolvedValue(1),
            });

            const result = await service.getWatchlist(mockUserId);

            expect(result.items).toEqual(mockItems);
            expect(result.total).toBe(1);
        });

        it('should filter by starred only when requested', async () => {
            mockModel.find.mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    skip: jest.fn().mockReturnValue({
                        limit: jest.fn().mockReturnValue({
                            exec: jest.fn().mockResolvedValue([]),
                        }),
                    }),
                }),
            });
            mockModel.countDocuments.mockReturnValue({
                exec: jest.fn().mockResolvedValue(0),
            });

            await service.getWatchlist(mockUserId, { starredOnly: true });

            expect(mockModel.find).toHaveBeenCalledWith(
                expect.objectContaining({ isStarred: true })
            );
        });
    });

    describe('getWatchlistItem', () => {
        it('should return a watchlist item by license plate', async () => {
            mockModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockWatchlistItem),
            });

            const result = await service.getWatchlistItem(mockUserId, '8689365');

            expect(result).toEqual(mockWatchlistItem);
        });

        it('should return null if item not found', async () => {
            mockModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });

            const result = await service.getWatchlistItem(mockUserId, '9999999');

            expect(result).toBeNull();
        });
    });

    describe('updateWatchlistItem', () => {
        it('should update a watchlist item', async () => {
            const updatedItem = { ...mockWatchlistItem, isStarred: true };
            mockModel.findOneAndUpdate.mockReturnValue({
                exec: jest.fn().mockResolvedValue(updatedItem),
            });

            const result = await service.updateWatchlistItem(mockUserId, '8689365', {
                isStarred: true,
            });

            expect(result.isStarred).toBe(true);
        });

        it('should throw NotFoundException if item not found', async () => {
            mockModel.findOneAndUpdate.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });

            await expect(
                service.updateWatchlistItem(mockUserId, '9999999', { isStarred: true })
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('removeFromWatchlist', () => {
        it('should remove a vehicle from watchlist', async () => {
            mockModel.deleteOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
            });

            const result = await service.removeFromWatchlist(mockUserId, '8689365');

            expect(result).toBe(true);
        });

        it('should throw NotFoundException if item not found', async () => {
            mockModel.deleteOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue({ deletedCount: 0 }),
            });

            await expect(
                service.removeFromWatchlist(mockUserId, '9999999')
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('isInWatchlist', () => {
        it('should return true if vehicle is in watchlist', async () => {
            mockModel.countDocuments.mockReturnValue({
                exec: jest.fn().mockResolvedValue(1),
            });

            const result = await service.isInWatchlist(mockUserId, '8689365');

            expect(result).toBe(true);
        });

        it('should return false if vehicle is not in watchlist', async () => {
            mockModel.countDocuments.mockReturnValue({
                exec: jest.fn().mockResolvedValue(0),
            });

            const result = await service.isInWatchlist(mockUserId, '9999999');

            expect(result).toBe(false);
        });
    });
});
