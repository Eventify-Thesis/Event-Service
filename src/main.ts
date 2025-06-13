import { NestFactory } from '@nestjs/core';
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
  try {
    // Create the application instance (removed HTTPS for Cloud Run)
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('event');
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalInterceptors(new TransformInterceptor());
    app.use(cookieParser());

    app.enableCors({
      origin: (origin, callback) => {
        callback(null, true); // Reflect request origin
      },
      credentials: true,
    });

    const configService = app.get(ConfigService);

    // Configure AWS
    configAWS.config.update({
      accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
      region: configService.get('AWS_REGION'),
    });

    // Swagger configuration
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

    // Try to set up microservices (optional - don't fail if Redis is not available)
    try {
      app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.REDIS,
        options: {
          host: configService.get('REDIS_HOST') || 'localhost',
          port: configService.get('REDIS_PORT') || 6379,
        },
      });

      await app.startAllMicroservices();
      console.log('✅ Microservices started successfully');
    } catch (error) {
      console.warn(
        '⚠️ Failed to start microservices (Redis may not be available):',
        error.message,
      );
      // Continue without microservices
    }

    // Use PORT environment variable or default to 8080 for Cloud Run
    const port = process.env.PORT || 8080;
    await app.listen(port);

    console.log(`🚀 Event Service is running on port ${port}`);
    console.log(
      `📚 API Documentation available at http://localhost:${port}/API`,
    );
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
