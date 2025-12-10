import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from '@vehicle-watchlist/database';
import { AuthModule } from '../auth/auth.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { WatchlistModule } from '../watchlist/watchlist.module';

@Module({
  imports: [DatabaseModule, AuthModule, VehiclesModule, WatchlistModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
