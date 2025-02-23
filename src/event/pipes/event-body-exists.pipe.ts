import { Injectable, PipeTransform } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { AppException } from 'src/common/exceptions/app.exception';
import { MESSAGE } from '../event.constant';
import { EventService } from '../services/event.service';
@Injectable()
export class EventBodyExists implements PipeTransform<any> {
  constructor(private moduleRef: ModuleRef) {}
  async transform(value: any) {
    const eventService = this.moduleRef.get(EventService, {
      strict: false,
    });

    if (!value.id) return value;
    const isExists = await eventService.checkExists({
      _id: value.id,
    });

    if (!isExists) {
      throw new AppException(MESSAGE.EVENT_NOT_FOUND);
    }
    return value;
  }
}
