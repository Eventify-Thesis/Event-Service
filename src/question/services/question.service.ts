import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../entities/question.entity';
import { CreateQuestionDto } from '../dto/create-question.dto';
import { UpdateQuestionDto } from '../dto/update-question.dto';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
  ) { }

  async checkExists(query: Record<string, any>) {
    const entity = await this.questionRepository.findOne({ where: query });
    return !!entity;
  }

  async create(eventId: number, createQuestionDto: CreateQuestionDto) {
    const maxOrder = await this.questionRepository
      .createQueryBuilder('question')
      .where('question.event_id = :eventId', { eventId })
      .orderBy('question.sort_order', 'DESC')
      .getOne();

    const order = maxOrder ? maxOrder.sortOrder + 1 : 1;
    const question = this.questionRepository.create({
      ...createQuestionDto,
      event: { id: eventId },
      sortOrder: order,
    });

    return await this.questionRepository.save(question);
  }

  async findAll(eventId: number) {
    return await this.questionRepository.find({
      where: { event: { id: eventId } },
      order: { sortOrder: 'ASC' },
    });
  }

  async findAllPublic(eventId: number) {
    return await this.questionRepository.find({
      where: { event: { id: eventId }, isHidden: false },
    });
  }

  async findOne(id: number, eventId: number) {
    return this.questionRepository.findOne({
      where: { id, event: { id: eventId } },
    });
  }

  async update(
    id: number,
    eventId: number,
    updateQuestionDto: UpdateQuestionDto,
  ) {
    await this.questionRepository.update(
      { id, event: { id: eventId } },
      updateQuestionDto,
    );
    return this.findOne(id, eventId);
  }

  async remove(id: number, eventId: number) {
    await this.questionRepository.delete({ id, event: { id: eventId } });
  }

  async updateOrder(sortedQuestionIds: { id: number; sortOrder: number }[]) {
    const queryRunner =
      this.questionRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const question of sortedQuestionIds) {
        await queryRunner.manager.update(
          Question,
          { id: question.id },
          { sortOrder: question.sortOrder },
        );
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
