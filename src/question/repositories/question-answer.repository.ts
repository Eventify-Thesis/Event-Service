import { PaginateModel } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import AbstractRepository from 'src/common/abstracts/repository.abstract';
import { QuestionAnswer, QuestionAnswerDocument } from '../entities/question-answer.entity';

@Injectable()
export class QuestionAnswerRepository extends AbstractRepository<QuestionAnswerDocument> {
  constructor(@InjectModel(QuestionAnswer.name) model: PaginateModel<QuestionAnswerDocument>) {
    super(model);
  }

  async findByEventId(eventId: number): Promise<QuestionAnswer[]> {
    return this.find({ eventId });
  }

  async findByQuestionId(questionId: number): Promise<QuestionAnswer[]> {
    return this.find({ questionId });
  }
}
