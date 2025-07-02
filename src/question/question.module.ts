import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionService } from './services/question.service';
import { Question } from './entities/question.entity';
import { PlannerQuestionController } from './controllers/planner/question.controller';
import { QuestionController } from './controllers/common/question.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Question])],
  controllers: [PlannerQuestionController, QuestionController],
  providers: [QuestionService],
  exports: [QuestionService],
})
export class QuestionModule { }
