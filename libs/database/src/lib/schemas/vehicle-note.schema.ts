import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VehicleNoteDocument = VehicleNote & Document;

@Schema({ timestamps: true })
export class VehicleNote {
    @Prop({ type: Types.ObjectId, ref: 'WatchlistItem', required: true, index: true })
    watchlistItemId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({ required: true, maxlength: 1000 })
    content!: string;

    @Prop()
    createdAt?: Date;

    @Prop()
    updatedAt?: Date;
}

export const VehicleNoteSchema = SchemaFactory.createForClass(VehicleNote);

// Index for efficient queries
VehicleNoteSchema.index({ watchlistItemId: 1, createdAt: -1 });
