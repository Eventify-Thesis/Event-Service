import { PaginateModel } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import AbstractRepository from 'src/common/abstracts/repository.abstract';
import { EventDocument, Event } from 'src/event/entities/event.entity';

@Injectable()
export class EventCommonRepository extends AbstractRepository<EventDocument> {
  constructor(@InjectModel(Event.name) model: PaginateModel<EventDocument>) {
    super(model);
  }
}
