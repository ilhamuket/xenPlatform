// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS untuk allow frontend hit API
  app.enableCors({
    origin: 'http://localhost:8080', // Frontend URL
    credentials: true,
  });
  
  await app.listen(3000);
  console.log('🚀 Backend running at http://localhost:3000');
}
bootstrap();