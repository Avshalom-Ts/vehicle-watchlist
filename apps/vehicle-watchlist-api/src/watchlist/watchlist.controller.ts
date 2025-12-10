import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
    Request,
} from '@nestjs/common';
import { WatchlistService } from './watchlist.service';
import { AddToWatchlistDto, UpdateWatchlistDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('watchlist')
@UseGuards(JwtAuthGuard)
export class WatchlistController {
    constructor(private readonly watchlistService: WatchlistService) { }

    /**
     * Add a vehicle to watchlist
     * POST /watchlist
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async addToWatchlist(@Request() req: any, @Body() dto: AddToWatchlistDto) {
        const userId = req.user.sub;
        const item = await this.watchlistService.addToWatchlist(userId, dto);

        return {
            success: true,
            message: 'Vehicle added to watchlist',
            data: item,
        };
    }

    /**
     * Get user's watchlist
     * GET /watchlist?starredOnly=true&limit=20&offset=0
     */
    @Get()
    @HttpCode(HttpStatus.OK)
    async getWatchlist(
        @Request() req: any,
        @Query('starredOnly') starredOnly?: string,
        @Query('limit') limit?: string,
        @Query('offset') offset?: string
    ) {
        const userId = req.user.sub;
        const result = await this.watchlistService.getWatchlist(userId, {
            starredOnly: starredOnly === 'true',
            limit: limit ? parseInt(limit, 10) : undefined,
            offset: offset ? parseInt(offset, 10) : undefined,
        });

        return {
            success: true,
            data: result.items,
            total: result.total,
        };
    }

    /**
     * Get a specific watchlist item
     * GET /watchlist/:licensePlate
     */
    @Get(':licensePlate')
    @HttpCode(HttpStatus.OK)
    async getWatchlistItem(@Request() req: any, @Param('licensePlate') licensePlate: string) {
        const userId = req.user.sub;
        const item = await this.watchlistService.getWatchlistItem(userId, licensePlate);

        return {
            success: true,
            data: item,
            inWatchlist: !!item,
        };
    }

    /**
     * Update a watchlist item (notes, starred)
     * PATCH /watchlist/:licensePlate
     */
    @Patch(':licensePlate')
    @HttpCode(HttpStatus.OK)
    async updateWatchlistItem(
        @Request() req: any,
        @Param('licensePlate') licensePlate: string,
        @Body() dto: UpdateWatchlistDto
    ) {
        const userId = req.user.sub;
        const item = await this.watchlistService.updateWatchlistItem(userId, licensePlate, dto);

        return {
            success: true,
            message: 'Watchlist item updated',
            data: item,
        };
    }

    /**
     * Toggle star status
     * PATCH /watchlist/:licensePlate/star
     */
    @Patch(':licensePlate/star')
    @HttpCode(HttpStatus.OK)
    async toggleStar(@Request() req: any, @Param('licensePlate') licensePlate: string) {
        const userId = req.user.sub;
        const item = await this.watchlistService.toggleStar(userId, licensePlate);

        return {
            success: true,
            message: item.isStarred ? 'Vehicle starred' : 'Vehicle unstarred',
            data: item,
        };
    }

    /**
     * Remove from watchlist
     * DELETE /watchlist/:licensePlate
     */
    @Delete(':licensePlate')
    @HttpCode(HttpStatus.OK)
    async removeFromWatchlist(@Request() req: any, @Param('licensePlate') licensePlate: string) {
        const userId = req.user.sub;
        await this.watchlistService.removeFromWatchlist(userId, licensePlate);

        return {
            success: true,
            message: 'Vehicle removed from watchlist',
        };
    }
}
