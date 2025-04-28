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
import { OrderModule } from './order/order.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { EmailModule } from './email/email.module';
import { MessageModule } from './message/message.module';
import { AttendeeModule } from './attendee/attendee.module';
import * as handlebarsHelpers from 'handlebars-helpers';

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
    OrderModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        transport: {
          host: 'smtp.sendgrid.net',
          port: 587,
          auth: {
            user: 'apikey',
            pass: cfg.get('SENDGRID_API_KEY'),
          },
        },
        defaults: {
          from: cfg.get('MAIL_FROM'),
        },
        template: {
          dir: join(__dirname, 'templates', 'email'),
          adapter: new HandlebarsAdapter({ ...handlebarsHelpers }), // or your preferred template engine
          options: {
            strict: true,
          },
        },
      }),
    }),
    EmailModule,
    MessageModule,
    AttendeeModule,
  ],
  controllers: [AppController],
  providers: [AppService, ClerkClientProvider],
})
export class AppModule { }
