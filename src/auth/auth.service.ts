import { BadRequestException, Injectable } from '@nestjs/common';

import { ForbiddenException } from '@nestjs/common';
import { EventService } from 'src/event/services/event.service';

@Injectable()
export class AuthService {
  constructor(private readonly eventService: EventService) {}

  async findOne(id: string) {
    const entity = await this.eventService.findOne(id);

    return entity;
  }
}
