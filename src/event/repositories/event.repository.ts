import { PaginateModel } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import AbstractRepository from 'src/common/abstracts/repository.abstract';
import { EventDocument } from '../entities/event.entity';

@Injectable()
export class EventRepository extends AbstractRepository<EventDocument> {
  constructor(@InjectModel(Event.name) model: PaginateModel<EventDocument>) {
    super(model);
  }
}
