import { EntityRepository, Repository } from 'typeorm';
import { QuizQuestion } from '../entities/quiz-question.entity';

@EntityRepository(QuizQuestion)
export class QuizQuestionRepository extends Repository<QuizQuestion> {
  // Add custom repository methods here if needed
}
