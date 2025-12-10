// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
   app.enableCors({
    origin: [
      'http://localhost:3000',  // Desarrollo
      'http://localhost:3001',  // Backend mismo
      'app://./',              // Electron production
      'file://',               // Electron file protocol
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

   app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  
  // Configuración de Swagger incluyendo seguridad Bearer JWT
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

  await app.listen(3001);
}
bootstrap();
