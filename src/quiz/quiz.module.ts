import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from './entities/quiz.entity';
import { QuizQuestion } from './entities/quiz-question.entity';
import { QuizAnswer } from './entities/quiz-answer.entity';
import { QuizController } from './controllers/common/quiz.controller';
import { QuizController as PlannerQuizController } from './controllers/planner/quiz.controller';
import { QuizService } from './services/quiz.service';
import { QuizRepository } from './repositories/quiz.repository';
import { Show } from '../event/entities/show.entity';
import { QuizResult } from './entities/quiz-result.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz, QuizQuestion, QuizAnswer, Show, QuizResult])],
  controllers: [QuizController, PlannerQuizController],
  providers: [QuizService, QuizRepository],
  exports: [QuizService]
})
export class QuizModule { }
