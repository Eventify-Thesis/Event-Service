import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Show } from 'src/event/entities/show.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ShowService {
  constructor(
    @InjectRepository(Show)
    private showRepository: Repository<Show>,
  ) { }

  async findOne(id: number): Promise<Show> {
    const show = await this.showRepository.findOne({
      where: { id },
    });

    if (!show) {
      throw new NotFoundException(`Show with ID ${id} not found`);
    }

    return show;
  }

  async findByEventId(eventId: number): Promise<Show[]> {
    return this.showRepository.find({
      where: { eventId },
      order: { startTime: 'ASC' },
    });
  }
}
