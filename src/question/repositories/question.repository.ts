import { PaginateModel } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import AbstractRepository from 'src/common/abstracts/repository.abstract';
import { Question, QuestionDocument } from '../entities/question.entity';

@Injectable()
export class QuestionRepository extends AbstractRepository<QuestionDocument> {
  constructor(@InjectModel(Question.name) model: PaginateModel<QuestionDocument>) {
    super(model);
  }

  async findByEventId(eventId: number): Promise<Question[]> {
    return this.model.find({ eventId }).sort({ order: 'asc' });
  }
}
