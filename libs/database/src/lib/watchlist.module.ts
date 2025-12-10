import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WatchlistItem, WatchlistItemSchema } from './schemas/watchlist.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: WatchlistItem.name, schema: WatchlistItemSchema },
        ]),
    ],
    exports: [MongooseModule],
})
export class WatchlistModule { }
