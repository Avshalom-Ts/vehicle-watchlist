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

    /**
     * Get watchlist analytics using MongoDB aggregation
     */
    async getAnalytics(userId: string): Promise<{
        totalVehicles: number;
        starredCount: number;
        byManufacturer: Array<{ _id: string; count: number }>;
        byYear: Array<{ _id: number; count: number }>;
        byFuelType: Array<{ _id: string; count: number }>;
        byColor: Array<{ _id: string; count: number }>;
        recentlyAdded: Array<{ licensePlate: string; manufacturer: string; model: string; createdAt: Date }>;
        averageYear: number;
        oldestVehicle: { year: number; manufacturer: string; model: string } | null;
        newestVehicle: { year: number; manufacturer: string; model: string } | null;
    }> {
        const userObjectId = new Types.ObjectId(userId);

        // Run all aggregations in parallel for performance
        const [stats, byManufacturer, byYear, byFuelType, byColor, recentlyAdded, yearStats] = await Promise.all([
            // Basic stats (total, starred)
            this.watchlistModel.aggregate([
                { $match: { userId: userObjectId } },
                {
                    $group: {
                        _id: null,
                        totalVehicles: { $sum: 1 },
                        starredCount: { $sum: { $cond: ['$isStarred', 1, 0] } },
                    },
                },
            ]).exec(),

            // Group by manufacturer
            this.watchlistModel.aggregate([
                { $match: { userId: userObjectId } },
                { $group: { _id: '$manufacturer', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 },
            ]).exec(),

            // Group by year
            this.watchlistModel.aggregate([
                { $match: { userId: userObjectId } },
                { $group: { _id: '$year', count: { $sum: 1 } } },
                { $sort: { _id: -1 } },
            ]).exec(),

            // Group by fuel type
            this.watchlistModel.aggregate([
                { $match: { userId: userObjectId, fuelType: { $ne: null } } },
                { $group: { _id: '$fuelType', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]).exec(),

            // Group by color
            this.watchlistModel.aggregate([
                { $match: { userId: userObjectId, color: { $ne: null } } },
                { $group: { _id: '$color', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 },
            ]).exec(),

            // Recently added (last 5)
            this.watchlistModel.aggregate([
                { $match: { userId: userObjectId } },
                { $sort: { createdAt: -1 } },
                { $limit: 5 },
                { $project: { licensePlate: 1, manufacturer: 1, model: 1, createdAt: 1 } },
            ]).exec(),

            // Year statistics (avg, min, max)
            this.watchlistModel.aggregate([
                { $match: { userId: userObjectId } },
                {
                    $group: {
                        _id: null,
                        avgYear: { $avg: '$year' },
                        minYear: { $min: '$year' },
                        maxYear: { $max: '$year' },
                    },
                },
            ]).exec(),
        ]);

        // Get oldest and newest vehicle details
        const [oldestVehicle, newestVehicle] = await Promise.all([
            yearStats[0]?.minYear
                ? this.watchlistModel.findOne(
                    { userId: userObjectId, year: yearStats[0].minYear },
                    { year: 1, manufacturer: 1, model: 1 }
                ).lean().exec()
                : null,
            yearStats[0]?.maxYear
                ? this.watchlistModel.findOne(
                    { userId: userObjectId, year: yearStats[0].maxYear },
                    { year: 1, manufacturer: 1, model: 1 }
                ).lean().exec()
                : null,
        ]);

        return {
            totalVehicles: stats[0]?.totalVehicles || 0,
            starredCount: stats[0]?.starredCount || 0,
            byManufacturer,
            byYear,
            byFuelType,
            byColor,
            recentlyAdded,
            averageYear: Math.round(yearStats[0]?.avgYear || 0),
            oldestVehicle: oldestVehicle ? {
                year: oldestVehicle.year,
                manufacturer: oldestVehicle.manufacturer,
                model: oldestVehicle.model,
            } : null,
            newestVehicle: newestVehicle ? {
                year: newestVehicle.year,
                manufacturer: newestVehicle.manufacturer,
                model: newestVehicle.model,
            } : null,
        };
    }
}
