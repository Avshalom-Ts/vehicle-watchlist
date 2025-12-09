import { Module, Global, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { startMemoryServer, stopMemoryServer } from './memory-server';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('DatabaseModule');
        let mongoUri = configService.get<string>('MONGO_URI');

        // If MONGO_URI is not provided, use in-memory MongoDB
        if (!mongoUri) {
          logger.warn(
            'MONGO_URI not found in environment variables. Starting MongoDB Memory Server...'
          );
          mongoUri = await startMemoryServer();
          logger.log('Using in-memory MongoDB for development');
        } else {
          logger.log('Connecting to MongoDB at: ' + mongoUri.split('@')[1] || mongoUri);
        }

        return {
          uri: mongoUri,
          retryAttempts: 5,
          retryDelay: 3000,
        };
      },
    }),
  ],
  controllers: [],
  providers: [],
  exports: [MongooseModule],
})
export class DatabaseModule {
  private readonly logger = new Logger(DatabaseModule.name);

  async onModuleDestroy() {
    this.logger.log('Cleaning up database connection...');
    await stopMemoryServer();
  }
}
