import { Module } from '@nestjs/common';
import { InterestService } from './interest.service';
import { InterestController } from './interest.controller';
import { InterestRepository } from './repositories/interest.repositories';
import { MongooseModule } from '@nestjs/mongoose';
import { Interest, InterestSchema } from './entities/Interest.entity';

@Module({
  controllers: [InterestController],
  providers: [InterestService, InterestRepository],
  imports: [
    MongooseModule.forFeature([
      { name: Interest.name, schema: InterestSchema },
    ]),
  ],
})
export class InterestModule {}
