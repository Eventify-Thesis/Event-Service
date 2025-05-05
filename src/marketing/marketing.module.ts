import { Module } from '@nestjs/common';
import { MarketingService } from './marketing.service';
import { MarketingController } from './marketing.controller';
import { FacebookModule } from 'src/facebook/facebook.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule, FacebookModule],
  controllers: [MarketingController],
  providers: [MarketingService,],
})
export class MarketingModule { }
