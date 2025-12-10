import { Injectable, Logger, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WatchlistItem, WatchlistItemDocument } from '@vehicle-watchlist/database';
import { AddToWatchlistDto, UpdateWatchlistDto } from './dto';

@Injectable()
export class WatchlistService {
    private readonly logger = new Logger(WatchlistService.name);

    constructor(
        @InjectModel(WatchlistItem.name)
        private readonly watchlistModel: Model<WatchlistItemDocument>
    ) { }

    /**
     * Add a vehicle to user's watchlist
     */
    async addToWatchlist(userId: string, dto: AddToWatchlistDto): Promise<WatchlistItemDocument> {
        this.logger.log(`Adding vehicle ${dto.licensePlate} to watchlist for user ${userId}`);

        try {
            const watchlistItem = new this.watchlistModel({
                userId: new Types.ObjectId(userId),
                ...dto,
            });

            const saved = await watchlistItem.save();
            this.logger.log(`Vehicle ${dto.licensePlate} added to watchlist`);
            return saved;
        } catch (error: any) {
            if (error.code === 11000) {
                throw new ConflictException('Vehicle already in watchlist');
            }
            throw error;
        }
    }

    /**
     * Get all watchlist items for a user
     */
    async getWatchlist(
        userId: string,
        options: { starredOnly?: boolean; limit?: number; offset?: number } = {}
    ): Promise<{ items: WatchlistItemDocument[]; total: number }> {
        const { starredOnly = false, limit = 20, offset = 0 } = options;

        const query: any = { userId: new Types.ObjectId(userId) };
        if (starredOnly) {
            query.isStarred = true;
        }

        const [items, total] = await Promise.all([
            this.watchlistModel
                .find(query)
                .sort({ createdAt: -1 })
                .skip(offset)
                .limit(limit)
                .exec(),
            this.watchlistModel.countDocuments(query).exec(),
        ]);

        return { items, total };
    }

    /**
     * Get a specific watchlist item
     */
    async getWatchlistItem(userId: string, licensePlate: string): Promise<WatchlistItemDocument | null> {
        return this.watchlistModel.findOne({
            userId: new Types.ObjectId(userId),
            licensePlate,
        }).exec();
    }

    /**
     * Update a watchlist item (notes, starred status)
     */
    async updateWatchlistItem(
        userId: string,
        licensePlate: string,
        dto: UpdateWatchlistDto
    ): Promise<WatchlistItemDocument> {
        const item = await this.watchlistModel.findOneAndUpdate(
            {
                userId: new Types.ObjectId(userId),
                licensePlate,
            },
            { $set: dto },
            { new: true }
        ).exec();

        if (!item) {
            throw new NotFoundException('Vehicle not found in watchlist');
        }

        this.logger.log(`Updated watchlist item ${licensePlate} for user ${userId}`);
        return item;
    }

    /**
     * Toggle starred status
     */
    async toggleStar(userId: string, licensePlate: string): Promise<WatchlistItemDocument> {
        const item = await this.watchlistModel.findOne({
            userId: new Types.ObjectId(userId),
            licensePlate,
        }).exec();

        if (!item) {
            throw new NotFoundException('Vehicle not found in watchlist');
        }

        item.isStarred = !item.isStarred;
        await item.save();

        this.logger.log(`Toggled star for ${licensePlate}: ${item.isStarred}`);
        return item;
    }

    /**
     * Remove a vehicle from watchlist
     */
    async removeFromWatchlist(userId: string, licensePlate: string): Promise<boolean> {
        const result = await this.watchlistModel.deleteOne({
            userId: new Types.ObjectId(userId),
            licensePlate,
        }).exec();

        if (result.deletedCount === 0) {
            throw new NotFoundException('Vehicle not found in watchlist');
        }

        this.logger.log(`Removed ${licensePlate} from watchlist for user ${userId}`);
        return true;
    }

    /**
     * Check if a vehicle is in user's watchlist
     */
    async isInWatchlist(userId: string, licensePlate: string): Promise<boolean> {
        const count = await this.watchlistModel.countDocuments({
            userId: new Types.ObjectId(userId),
            licensePlate,
        }).exec();

        return count > 0;
    }
}
