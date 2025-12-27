import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { VehicleNote, VehicleNoteDocument } from '@vehicle-watchlist/database';
import { CreateVehicleNoteDto, UpdateVehicleNoteDto } from './dto';

@Injectable()
export class VehicleNoteService {
    private readonly logger = new Logger(VehicleNoteService.name);

    constructor(
        @InjectModel(VehicleNote.name)
        private readonly vehicleNoteModel: Model<VehicleNoteDocument>
    ) { }

    /**
     * Create a new note for a watchlist item
     */
    async createNote(userId: string, dto: CreateVehicleNoteDto): Promise<VehicleNoteDocument> {
        this.logger.log(`Creating note for watchlist item ${dto.watchlistItemId}`);

        const note = new this.vehicleNoteModel({
            userId: new Types.ObjectId(userId),
            watchlistItemId: new Types.ObjectId(dto.watchlistItemId),
            content: dto.content,
        });

        const saved = await note.save();
        this.logger.log(`Note created successfully`);
        return saved;
    }

    /**
     * Get all notes for a watchlist item
     */
    async getNotesByWatchlistItem(userId: string, watchlistItemId: string): Promise<VehicleNoteDocument[]> {
        const notes = await this.vehicleNoteModel
            .find({
                userId: new Types.ObjectId(userId),
                watchlistItemId: new Types.ObjectId(watchlistItemId),
            })
            .sort({ createdAt: -1 })
            .exec();

        return notes;
    }

    /**
     * Get a specific note by ID
     */
    async getNoteById(userId: string, noteId: string): Promise<VehicleNoteDocument> {
        const note = await this.vehicleNoteModel.findById(noteId).exec();

        if (!note) {
            throw new NotFoundException('Note not found');
        }

        // Ensure user owns this note
        if (note.userId.toString() !== userId) {
            throw new ForbiddenException('You do not have permission to access this note');
        }

        return note;
    }

    /**
     * Update a note
     */
    async updateNote(userId: string, noteId: string, dto: UpdateVehicleNoteDto): Promise<VehicleNoteDocument> {
        const note = await this.getNoteById(userId, noteId);

        note.content = dto.content;
        await note.save();

        this.logger.log(`Note ${noteId} updated successfully`);
        return note;
    }

    /**
     * Delete a note
     */
    async deleteNote(userId: string, noteId: string): Promise<boolean> {
        const note = await this.getNoteById(userId, noteId);

        await note.deleteOne();
        this.logger.log(`Note ${noteId} deleted successfully`);
        return true;
    }

    /**
     * Delete all notes for a watchlist item
     */
    async deleteNotesByWatchlistItem(userId: string, watchlistItemId: string): Promise<number> {
        const result = await this.vehicleNoteModel.deleteMany({
            userId: new Types.ObjectId(userId),
            watchlistItemId: new Types.ObjectId(watchlistItemId),
        }).exec();

        this.logger.log(`Deleted ${result.deletedCount} notes for watchlist item ${watchlistItemId}`);
        return result.deletedCount;
    }
}
