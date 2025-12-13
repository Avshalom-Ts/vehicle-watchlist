import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WatchlistModule as WatchlistDbModule, VehicleNote, VehicleNoteSchema } from '@vehicle-watchlist/database';
import { WatchlistController } from './watchlist.controller';
import { WatchlistService } from './watchlist.service';
import { VehicleNoteController } from './vehicle-note.controller';
import { VehicleNoteService } from './vehicle-note.service';

@Module({
    imports: [
        WatchlistDbModule,
        MongooseModule.forFeature([{ name: VehicleNote.name, schema: VehicleNoteSchema }]),
    ],
    controllers: [WatchlistController, VehicleNoteController],
    providers: [WatchlistService, VehicleNoteService],
    exports: [WatchlistService, VehicleNoteService],
})
export class WatchlistModule { }
