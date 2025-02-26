import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EventModule } from './event/event.module';
import { ClerkClientProvider } from 'src/providers/clerk-client.provider';
import appConfig from 'src/config/app';
import databaseConfig from 'src/config/database';
import { CategoryModule } from './category/category.module';
import { AuthModule } from './auth/auth.module';
import { LocationModule } from './location/location.module';
import { MediaModule } from './media/media.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    EventModule,
    AuthModule,
    CategoryModule,
    LocationModule,
    MediaModule,
  ],
  controllers: [AppController],
  providers: [AppService, ClerkClientProvider],
})
export class AppModule {}
