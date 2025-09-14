import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*', // In production, you'd want to restrict this to your frontend URL
    methods: ['GET', 'POST'],
    credentials: true,
  });
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  Logger.log(`🚀 Planning Poker backend server running on port ${port}`);
}
bootstrap();
