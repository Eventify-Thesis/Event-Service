import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from './entities/quiz.entity';
import { QuizQuestion } from './entities/quiz-question.entity';
import { QuizAnswer } from './entities/quiz-answer.entity';
import { QuizController } from './controllers/common/quiz.controller';
import { QuizController as PlannerQuizController } from './controllers/planner/quiz.controller';
import { QuizService } from './services/quiz.service';
import { QuizUserService } from './services/quiz-user.service';
import { QuizRedisService } from './services/quiz-redis.service';
import { QuizRepository } from './repositories/quiz.repository';
import { Show } from '../event/entities/show.entity';
import { QuizResult } from './entities/quiz-result.entity';
import { QuizGateway } from './gateways/quiz.gateway';
import { RedisModule } from '../redis/redis.module';
import { QuizPlannerGateway } from './gateways/quiz-planner.gateway';
import { QuizQuestionRepository } from './repositories/quiz-question.repository';
import { QuizAnswerRepository } from './repositories/quiz-answer.repository';
import { QuizResultRepository } from './repositories/quiz-result.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Quiz,
      QuizQuestion,
      QuizAnswer,
      Show,
      QuizResult,
    ]),
    RedisModule,
  ],
  controllers: [QuizController, PlannerQuizController],
  providers: [
    QuizService,
    QuizUserService,
    QuizRedisService,
    QuizRepository,
    QuizQuestionRepository,
    QuizAnswerRepository,
    QuizResultRepository,
    QuizGateway,
    QuizPlannerGateway,
  ],
  exports: [
    QuizService, 
    QuizUserService, 
    QuizRedisService, 
    QuizRepository,
    QuizQuestionRepository,
    QuizAnswerRepository,
    QuizResultRepository
  ],
})
export class QuizModule {}
