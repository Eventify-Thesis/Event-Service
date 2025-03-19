import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from './entities/city.entity';
import { District } from './entities/district.entity';
import { Ward } from './entities/ward.entity';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
    @InjectRepository(District)
    private readonly districtRepository: Repository<District>,
    @InjectRepository(Ward)
    private readonly wardRepository: Repository<Ward>,
  ) {}

  async findAllCities(countryId: number) {
    const cities = await this.cityRepository
      .createQueryBuilder('city')
      .where('city.country_id = :countryId', { countryId })
      .orderBy('city.sort', 'ASC')
      .getMany();

    return cities;
  }

  async findDistrictsByCity(cityId: string) {
    return await this.districtRepository
      .createQueryBuilder('district')
      .where('district.city_id = :cityId', { cityId })
      .orderBy('district.sort', 'ASC')
      .getMany();
  }

  async findWardsByDistrict(districtId: string) {
    return await this.wardRepository
      .createQueryBuilder('ward')
      .where('ward.district_id = :districtId', { districtId })
      .orderBy('ward.sort', 'ASC')
      .getMany();
  }
}
