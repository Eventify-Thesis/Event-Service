import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventModule } from './event/event.module';
import { CategoryModule } from './category/category.module';
import { LocationModule } from './location/location.module';
import { MediaModule } from './media/media.module';
import { MemberModule } from './member/member.module';
import { QuestionModule } from './question/question.module';
import { VoucherModule } from './voucher/voucher.module';
import { AuthModule } from './auth/auth.module';
import { ClerkClientProvider } from 'src/providers/clerk-client.provider';
import { SeatingPlanModule } from './seating-plan/seating-plan.module';
import { InterestModule } from './interest/interest.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USERNAME'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('DATABASE_SYNCHRONIZE') === 'true',
      }),
      inject: [ConfigService],
    }),
    EventModule,
    CategoryModule,
    LocationModule,
    MediaModule,
    MemberModule,
    QuestionModule,
    VoucherModule,
    AuthModule,
    SeatingPlanModule,
    InterestModule,
  ],
  controllers: [AppController],
  providers: [AppService, ClerkClientProvider],
})
export class AppModule {}
