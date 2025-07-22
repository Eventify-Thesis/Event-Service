import { NestFactory } from '@nestjs/core';
import * as fs from 'fs';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import * as configAWS from 'aws-sdk';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppExceptionFilter } from './common/exceptions/app-exception.filter';

async function bootstrap() {
  let httpsOptions = undefined;
  if (process.env.NODE_ENV !== 'production') {
    try {
      httpsOptions = {
        key: fs.readFileSync('localhost-key.pem'),
        cert: fs.readFileSync('localhost.pem'),
      };
    } catch (error) {
      console.log('SSL certificates not found, running without HTTPS');
      httpsOptions = undefined;
    }
  }
  const app = await NestFactory.create(AppModule, { 
    httpsOptions,
    bodyParser: true,
    rawBody: true
  });
  app.setGlobalPrefix('event');
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.use(cookieParser());

  // Increase body size limit to handle large payloads
  const express = require('express');
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  app.enableCors({
    origin: (origin, callback) => {
      callback(null, true); // Reflect request origin
    },
    credentials: true,
  });
  const configService = app.get(ConfigService);
  await app.listen(configService.get<number>('PORT') || 8080);

  configAWS.config.update({
    accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
    secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
    region: configService.get('AWS_REGION'),
  });

  const config = new DocumentBuilder()
    .setTitle('EventService-API')
    .setDescription('Event Service - Eventify App API description')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    })
    .build();

  const defaultOptions = {
    swaggerOptions: {
      authAction: {
        defaultBearerAuth: {
          name: 'defaultBearerAuth',
          schema: {
            description: 'Default',
            type: 'http',
            in: 'header',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
          value: 'thisIsASampleBearerAuthToken123',
        },
      },
    },
  };
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('API', app, document, defaultOptions);

  // Set up microservices
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: configService.get('REDIS_HOST') || 'localhost',
      port: configService.get('REDIS_PORT') || 6379,
    },
  });

  await app.startAllMicroservices();
}
bootstrap();
