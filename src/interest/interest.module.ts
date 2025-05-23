import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterestService } from './interest.service';
import { InterestController } from './interest.controller';
import { Interest } from './entities/interest.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Interest]),
    TypeOrmModule.forFeature([
      require('../event/entities/ticket-type.entity').TicketType,
      require('../event/entities/show.entity').Show,
      require('../location/entities/city.entity').City,
      require('../location/entities/district.entity').District,
      require('../location/entities/ward.entity').Ward
    ])
  ],
  controllers: [InterestController],
  providers: [InterestService],
  exports: [InterestService],
})
export class InterestModule {}
