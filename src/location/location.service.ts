import { Injectable } from '@nestjs/common';
import { CityRepository } from './repositories/region.repository';
import { DistrictRepository } from './repositories/district.repository';
import { WardRepository } from './repositories/ward.repository';

@Injectable()
export class LocationService {
  constructor(
    private readonly cityRepository: CityRepository,
    private readonly districtRepository: DistrictRepository,
    private readonly wardRepository: WardRepository,
  ) {}

  async findListCity(regionId: string) {
    return await this.cityRepository.find({
      countryId: regionId,
    });
  }

  async findListDistrict(cityId: string) {
    return await this.districtRepository.find({
      cityId: cityId,
    });
  }

  async findListWard(districtId: string) {
    return await this.wardRepository.find({
      districtId: districtId,
    });
  }
}
