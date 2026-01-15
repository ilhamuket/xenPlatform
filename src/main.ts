// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ CORS Configuration - Allow Vercel domains
  app.enableCors({
    origin: [
      // Development
      'http://localhost:8080',
      'http://localhost:3000',
      'http://127.0.0.1:8080',
      
      // Production
      'https://xendit-frontend.vercel.app',
      
      // All Vercel preview deployments
      /^https:\/\/xendit-frontend-.*\.vercel\.app$/,
      /^https:\/\/.*\.vercel\.app$/,
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
    ],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log('🚀 Server running on port', port);
  console.log('✅ CORS enabled for:');
  console.log('   - http://localhost:8080');
  console.log('   - https://xendit-frontend.vercel.app');
  console.log('   - All *.vercel.app domains');
}

bootstrap();