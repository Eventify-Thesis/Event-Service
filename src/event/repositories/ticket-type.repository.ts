import { PaginateModel } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import AbstractRepository from 'src/common/abstracts/repository.abstract';
import { Ticket, TicketDocument } from '../entities/ticket-type.entity';

@Injectable()
export class TicketRepository extends AbstractRepository<TicketDocument> {
  constructor(@InjectModel(Ticket.name) model: PaginateModel<TicketDocument>) {
    super(model);
  }

  async deleteMany(eventId: string): Promise<void> {
    await this.model.deleteMany({ eventId });
  }
}
