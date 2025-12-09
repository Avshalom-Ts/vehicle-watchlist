import { MongoMemoryServer } from 'mongodb-memory-server';
import { Logger } from '@nestjs/common';

let mongoServer: MongoMemoryServer | null = null;
const logger = new Logger('MongoMemoryServer');

export async function startMemoryServer(): Promise<string> {
    if (mongoServer) {
        return mongoServer.getUri();
    }

    logger.log('Starting MongoDB Memory Server...');
    mongoServer = await MongoMemoryServer.create({
        instance: {
            dbName: 'vehicle-watchlist',
        },
    });

    const uri = mongoServer.getUri();
    logger.log(`MongoDB Memory Server started at: ${uri}`);
    return uri;
}

export async function stopMemoryServer(): Promise<void> {
    if (mongoServer) {
        logger.log('Stopping MongoDB Memory Server...');
        await mongoServer.stop();
        mongoServer = null;
        logger.log('MongoDB Memory Server stopped');
    }
}
