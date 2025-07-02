import { EntityRepository, Repository } from 'typeorm';
import { QuizResult } from '../entities/quiz-result.entity';

@EntityRepository(QuizResult)
export class QuizResultRepository extends Repository<QuizResult> {
  // Add custom repository methods here if needed
}
