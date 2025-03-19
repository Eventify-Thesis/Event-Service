import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LocationService } from './location.service';
@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get('regions/:regionId/cities')
  async findListCity(@Param('regionId') regionId: string) {
    return await this.locationService.findAllCities(+regionId);
  }

  @Get('cities/:cityId/districts')
  async findListDistrict(@Param('cityId') cityId: string) {
    return await this.locationService.findDistrictsByCity(cityId);
  }

  @Get('districts/:districtId/wards')
  async findListWard(@Param('districtId') districtId: string) {
    return await this.locationService.findWardsByDistrict(districtId);
  }
}
