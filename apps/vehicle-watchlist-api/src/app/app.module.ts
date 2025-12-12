import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from '@vehicle-watchlist/database';
import { RateLimitModule } from '@vehicle-watchlist/rate-limit';
import { AuthModule } from '../auth/auth.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { WatchlistModule } from '../watchlist/watchlist.module';

@Module({
  imports: [
    DatabaseModule,
    RateLimitModule.register({
      options: {
        windowSec: 60, // 1 minute
        max: 100, // 100 requests per minute
        message: 'Too many requests, please try again later.',
      },
    }),
    AuthModule,
    VehiclesModule,
    WatchlistModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
