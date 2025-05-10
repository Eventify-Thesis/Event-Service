import { DataSource, Repository } from 'typeorm';
import { Quiz } from '../entities/quiz.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class QuizRepository extends Repository<Quiz> {
  constructor(private dataSource: DataSource) {
    super(Quiz, dataSource.createEntityManager());
  }

  async findWithQuestions(showId: number): Promise<Quiz> {
    return this.createQueryBuilder('quiz')
      .leftJoinAndSelect('quiz.questions', 'questions')
      .where('quiz.showId = :showId', { showId })
      .orderBy('questions.sortOrder', 'ASC')
      .getOne();
  }

  async findActiveQuiz(showId: number): Promise<Quiz> {
    return this.findOne({
      where: { 
        showId,
        isCompleted: false 
      },
      relations: ['questions']
    });
  }
}