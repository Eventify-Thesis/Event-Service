import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionService } from './services/question.service';
import { Question, QuestionSchema } from './entities/question.entity';
import {
  QuestionAnswer,
  QuestionAnswerSchema,
} from './entities/question-answer.entity';
import { QuestionRepository } from './repositories/question.repository';
import { QuestionAnswerRepository } from './repositories/question-answer.repository';
import { PlannerQuestionController } from './controllers/planner/question.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Question.name, schema: QuestionSchema },
      { name: QuestionAnswer.name, schema: QuestionAnswerSchema },
    ]),
  ],
  controllers: [PlannerQuestionController],
  providers: [QuestionService, QuestionRepository, QuestionAnswerRepository],
  exports: [QuestionService],
})
export class QuestionModule {}
