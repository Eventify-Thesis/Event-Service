import { Module } from '@nestjs/common';
import { FacebookService } from './facebook.service';
import { FacebookAuthController, FacebookController } from './facebook.controller';
import { ConfigModule } from '@nestjs/config';
import { FacebookToken } from './entities/facebook-token.entity';
import { FacebookPost } from './entities/facebook-post.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([FacebookToken, FacebookPost])],
  controllers: [FacebookController, FacebookAuthController],
  providers: [FacebookService],
  exports: [FacebookService],
})
export class FacebookModule { }
