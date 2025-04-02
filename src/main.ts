import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import * as configAWS from 'aws-sdk';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('event');
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.use(cookieParser());

  const cors = require('cors');
  const corsOptions = {
    origin: 'http://localhost:5174',
    credentials: true,
    optionSuccessStatus: 200,
  };
  app.use(cors(corsOptions));

  const configService = app.get(ConfigService);
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
  await app.listen(configService.get<number>('PORT'));
}
bootstrap();
