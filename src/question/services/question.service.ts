import { Injectable } from '@nestjs/common';
import { QuestionRepository } from '../repositories/question.repository';
import { QuestionAnswerRepository } from '../repositories/question-answer.repository';
import { CreateQuestionDto } from '../dto/create-question.dto';
import { UpdateQuestionDto } from '../dto/update-question.dto';

@Injectable()
export class QuestionService {
  constructor(
    private readonly questionRepository: QuestionRepository,
    private readonly answerRepository: QuestionAnswerRepository,
  ) {}

  async checkExists(query: Record<string, any>) {
    const entity = await this.questionRepository.exists(query);
    return !!entity;
  }

  async create(eventId: string, createQuestionDto: CreateQuestionDto) {
    const maxOrder = await this.questionRepository.model
      .find({ eventId })
      .sort({ sortOrder: -1 })
      .select('sortOrder')
      .exec();
    const order =
      maxOrder && maxOrder.length > 0 ? maxOrder[0].sortOrder + 1 : 1;
    return await this.questionRepository.create({
      ...createQuestionDto,
      eventId,
      sortOrder: order,
    });
  }

  async findAll(eventId: string) {
    return await this.questionRepository.find(
      { eventId },
      {
        sort: { sortOrder: 1 },
      },
    );
  }

  async findAllPublic(eventId: string) {
    return await this.questionRepository.find({ eventId, isHidden: false });
  }

  async findOne(id: string, eventId: string) {
    return this.questionRepository.findOne({ _id: id, eventId });
  }

  async updateOrder(
    eventId: string,
    orderData: { id: string; order: number }[],
  ) {
    const bulkOps = orderData.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: id, eventId },
        update: { sortOrder: order },
      },
    }));

    return this.questionRepository.bulkWrite(bulkOps);
  }

  async update(
    id: string,
    eventId: string,
    updateQuestionDto: UpdateQuestionDto,
  ) {
    return await this.questionRepository.updateOne(
      { _id: id, eventId },
      updateQuestionDto,
    );
  }

  async remove(id: string, eventId: string) {
    return await this.questionRepository.deleteOne({ _id: id, eventId });
  }
}
