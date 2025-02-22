import { Injectable, PipeTransform } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { EventService } from '../event.service';
import { AppException } from 'src/common/exceptions/app.exception';
import { MESSAGE } from '../event.constant';
@Injectable()
export class EventExists implements PipeTransform<any> {
  constructor(private moduleRef: ModuleRef) {}
  async transform(value: string) {
    const eventService = this.moduleRef.get(EventService, {
      strict: false,
    });
    const isExists = await eventService.checkExists({
      _id: value,
    });

    if (!isExists) {
      throw new AppException(MESSAGE.EVENT_NOT_FOUND);
    }
    return value;
  }
}
