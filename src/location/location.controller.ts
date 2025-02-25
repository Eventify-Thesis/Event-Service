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
  async findAll(@Param('regionId') regionId: string) {}
}
