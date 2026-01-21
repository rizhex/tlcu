import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // CORS desde variables de entorno
  const corsOrigins = configService
    .get<string>('CORS_ORIGINS', 'http://localhost:3000,http://localhost:3001')
    .split(',');
    
  app.enableCors({
    origin: corsOrigins,
    credentials: configService.get<boolean>('CORS_CREDENTIALS', true),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Upload limits desde variables
  app.use(json({ limit: configService.get<string>('JSON_LIMIT', '50mb') }));
  app.use(urlencoded({
    extended: true,
    limit: configService.get<string>('URLENCODED_LIMIT', '50mb'),
  }));

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Tesoro Lexicográfico API')
    .setDescription('API para el manejo de diccionarios')
    .setVersion('1.0')
    .addTag('dictionaries')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Ingrese su token JWT aquí',
        name: 'Authorization',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);
  console.log(`Application running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
}
bootstrap();