import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';

export type WatchlistItemDocument = WatchlistItem & Document;

@Schema({ timestamps: true })
export class WatchlistItem {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({ required: true, index: true })
    licensePlate!: string;

    // Cached vehicle data from gov.il API
    @Prop({ required: true })
    manufacturer!: string;

    @Prop({ required: true })
    model!: string;

    @Prop()
    commercialName?: string;

    @Prop({ required: true })
    year!: number;

    @Prop()
    color?: string;

    @Prop()
    fuelType?: string;

    @Prop()
    ownership?: string;

    // Star/favorite flag
    @Prop({ default: false })
    isStarred!: boolean;

    @Prop()
    createdAt?: Date;

    @Prop()
    updatedAt?: Date;
}

export const WatchlistItemSchema = SchemaFactory.createForClass(WatchlistItem);

// Compound index to ensure a user can only save a vehicle once
WatchlistItemSchema.index({ userId: 1, licensePlate: 1 }, { unique: true });
