import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import * as configAWS from 'aws-sdk';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('event');
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());

  const cors = require('cors');
  const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true, //access-control-allow-credentials:true
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
    .setTitle('Grab-Team14-API')
    .setDescription('Emploi App API description')
    .setVersion('1.0')
    .addTag('Emploi')
    .addCookieAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('API', app, document);
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
