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
@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get('regions/:regionId')
  async findListCity(@Param('regionId') regionId: string) {
    return await this.locationService.findListCity(regionId);
  }

  @Get('districts/:cityId')
  async findListDistrict(@Param('cityId') cityId: string) {
    return await this.locationService.findListDistrict(cityId);
  }

  @Get('wards/:districtId')
  async findListWard(@Param('districtId') districtId: string) {
    return await this.locationService.findListWard(districtId);
  }
}
