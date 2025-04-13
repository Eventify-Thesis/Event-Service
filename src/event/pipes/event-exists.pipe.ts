import { Injectable, PipeTransform } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { AppException } from 'src/common/exceptions/app.exception';
import { MESSAGE } from '../event.constant';
import { EventService } from '../services/event.service';
@Injectable()
export class EventExists implements PipeTransform<any> {
  constructor(private moduleRef: ModuleRef) {}
  async transform(value: string) {
    const eventService = this.moduleRef.get(EventService, {
      strict: false,
    });
    const isExists = await eventService.checkExists(+value);

    if (!isExists) {
      throw new AppException(MESSAGE.EVENT_NOT_FOUND);
    }
    return value;
  }
}
