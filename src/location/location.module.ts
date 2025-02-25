import { Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { City, CitySchema } from './entities/city.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { CityRepository } from './repositories/region.repository';
import { District, DistrictSchema } from './entities/district.entity';
import { DistrictRepository } from './repositories/district.repository';
import { Ward, WardSchema } from './entities/ward.entity';
import { WardRepository } from './repositories/ward.repository';

@Module({
  controllers: [LocationController],
  providers: [
    LocationService,
    CityRepository,
    DistrictRepository,
    WardRepository,
  ],
  imports: [
    MongooseModule.forFeature([
      { name: City.name, schema: CitySchema },
      { name: District.name, schema: DistrictSchema },
      { name: Ward.name, schema: WardSchema },
    ]),
  ],
})
export class LocationModule {}
