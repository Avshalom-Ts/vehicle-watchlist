import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    UseGuards,
    HttpCode,
    HttpStatus,
    Request,
} from '@nestjs/common';
import { VehicleNoteService } from './vehicle-note.service';
import { CreateVehicleNoteDto, UpdateVehicleNoteDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('watchlist/notes')
@UseGuards(JwtAuthGuard)
export class VehicleNoteController {
    constructor(private readonly vehicleNoteService: VehicleNoteService) { }

    /**
     * Create a new note
     * POST /watchlist/notes
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createNote(@Request() req: any, @Body() dto: CreateVehicleNoteDto) {
        const userId = req.user.id;
        const note = await this.vehicleNoteService.createNote(userId, dto);

        return {
            success: true,
            message: 'Note created successfully',
            data: note,
        };
    }

    /**
     * Get all notes for a watchlist item
     * GET /watchlist/notes/item/:watchlistItemId
     */
    @Get('item/:watchlistItemId')
    @HttpCode(HttpStatus.OK)
    async getNotesByWatchlistItem(
        @Request() req: any,
        @Param('watchlistItemId') watchlistItemId: string
    ) {
        const userId = req.user.id;
        const notes = await this.vehicleNoteService.getNotesByWatchlistItem(userId, watchlistItemId);

        return {
            success: true,
            data: notes,
            total: notes.length,
        };
    }

    /**
     * Get a specific note
     * GET /watchlist/notes/:noteId
     */
    @Get(':noteId')
    @HttpCode(HttpStatus.OK)
    async getNote(@Request() req: any, @Param('noteId') noteId: string) {
        const userId = req.user.id;
        const note = await this.vehicleNoteService.getNoteById(userId, noteId);

        return {
            success: true,
            data: note,
        };
    }

    /**
     * Update a note
     * PATCH /watchlist/notes/:noteId
     */
    @Patch(':noteId')
    @HttpCode(HttpStatus.OK)
    async updateNote(
        @Request() req: any,
        @Param('noteId') noteId: string,
        @Body() dto: UpdateVehicleNoteDto
    ) {
        const userId = req.user.id;
        const note = await this.vehicleNoteService.updateNote(userId, noteId, dto);

        return {
            success: true,
            message: 'Note updated successfully',
            data: note,
        };
    }

    /**
     * Delete a note
     * DELETE /watchlist/notes/:noteId
     */
    @Delete(':noteId')
    @HttpCode(HttpStatus.OK)
    async deleteNote(@Request() req: any, @Param('noteId') noteId: string) {
        const userId = req.user.id;
        await this.vehicleNoteService.deleteNote(userId, noteId);

        return {
            success: true,
            message: 'Note deleted successfully',
        };
    }
}
