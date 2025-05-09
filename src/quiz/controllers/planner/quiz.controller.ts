import { Controller, Post, Body, Get, Param, UseGuards, Put, Patch, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ClerkAuthGuard } from '../../../auth/clerk-auth.guard';
import EventRole from '../../../auth/event-role/event-roles.enum';
import EventRoleGuard from '../../../auth/event-role/event-roles.guards';
import { QuizService } from '../../services/quiz.service';
import { CreateQuizDto } from '../../dto/create-quiz.dto';
import { UpdateQuizDto } from 'src/quiz/dto/update-quiz.dto';
import { SubmitAnswerDto } from '../../dto/submit-answer.dto';

@Controller('planner/shows/:showId/quizzes')
@ApiTags('Quiz')
@UseGuards(ClerkAuthGuard, EventRoleGuard(EventRole.OWNER))
@ApiBearerAuth()
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  create(@Param('showId') showId: number, @Body() createQuizDto: CreateQuizDto) {
    return this.quizService.create({ ...createQuizDto, showId });
  }

  @Get()
  findAll(@Param('showId') showId: number) {
    return this.quizService.findByShow(showId);
  }

  @Put(':quizId')
  updateQuiz(
    @Param('quizId') quizId: string,
    @Body() updateQuizDto: UpdateQuizDto
  ) {
    return this.quizService.update(quizId, updateQuizDto);
  }

  @Patch(':quizId/activate')
  activateQuiz(@Param('quizId') quizId: string) {
    return this.quizService.updateStatus(quizId, true);
  }

  @Patch(':quizId/deactivate')
  deactivateQuiz(@Param('quizId') quizId: string) {
    return this.quizService.updateStatus(quizId, false);
  }

  @Delete(':quizId')
  deleteQuiz(@Param('quizId') quizId: string) {
    return this.quizService.delete(quizId);
  }

  @Post(':quizId/generate')
  generateQuestions(
    @Body() { topic, difficulty, count }: { topic: string; difficulty?: string; count?: number }
  ) {
    return this.quizService.generateQuizQuestions(topic, difficulty, count);
  }

  @Get(':quizId/results')
  getQuizAnalytics(@Param('quizId') quizId: string) {
    return this.quizService.getQuizAnalytics(quizId);
  }

  @Post(':quizId/submit')
  async submitAnswers(
    @Param('quizId') quizId: string,
    @Body() submitAnswerDto: SubmitAnswerDto[],
  ) {
    // Note: You'll need to get userId from auth context in real implementation
    const userId = 'temp-user-id'; 
    return this.quizService.submitQuizAnswers(quizId, userId, submitAnswerDto);
  }

  @Get(':quizId/results')
  async getResults(@Param('quizId') quizId: string) {
    return this.quizService.getQuizResults(quizId);
  }

  @Get(':quizId/results/:userId')
  async getUserResults(
    @Param('quizId') quizId: string,
    @Param('userId') userId: string,
  ) {
    return this.quizService.getQuizResults(quizId, userId);
  }
}