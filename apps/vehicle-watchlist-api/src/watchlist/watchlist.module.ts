import { Module } from '@nestjs/common';
import { WatchlistModule as WatchlistDbModule } from '@vehicle-watchlist/database';
import { WatchlistController } from './watchlist.controller';
import { WatchlistService } from './watchlist.service';

@Module({
    imports: [WatchlistDbModule],
    controllers: [WatchlistController],
    providers: [WatchlistService],
    exports: [WatchlistService],
})
export class WatchlistModule { }
