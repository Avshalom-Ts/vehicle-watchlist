/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from './app/app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Enable cookie parser
  app.use(cookieParser());

  // Enable Zod validation globally
  app.useGlobalPipes(new ZodValidationPipe());

  // Enable CORS for frontend communication with credentials
  app.enableCors({
    origin: ['http://localhost:4200', 'http://localhost:4001', 'http://localhost:80', 'http://localhost:3000'],
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
