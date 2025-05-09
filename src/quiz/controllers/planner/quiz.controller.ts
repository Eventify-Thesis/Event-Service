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
// @UseGuards(ClerkAuthGuard, EventRoleGuard(EventRole.OWNER))
// @ApiBearerAuth()
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  async create(@Param('showId') showId: number, @Body() createQuizDto: CreateQuizDto) {
    return await this.quizService.create({ ...createQuizDto, showId });
  }

  @Get()
  async findAll(@Param('showId') showId: number) {
    return await this.quizService.findByShow(showId);
  }

  @Put(':quizId')
  async updateQuiz(
    @Param('quizId') quizId: number,
    @Body() updateQuizDto: UpdateQuizDto
  ) {
    return await this.quizService.update(quizId, updateQuizDto);
  }

  @Patch(':quizId/activate')
  async activateQuiz(@Param('quizId') quizId: number) {
    return await this.quizService.updateStatus(quizId, true);
  }

  @Patch(':quizId/deactivate')
  async deactivateQuiz(@Param('quizId') quizId: number) {
    return await this.quizService.updateStatus(quizId, false);
  }

  @Delete(':quizId')
  async deleteQuiz(@Param('quizId') quizId: number) {
    return await this.quizService.delete(quizId);
  }

  @Post(':quizId/generate')
  async generateQuestions(
    @Body() { topic, difficulty, count }: { topic: string; difficulty?: string; count?: number }
  ) {
    return await this.quizService.generateQuizQuestions(topic, difficulty, count);
  }

  @Get(':quizId/results')
  async getQuizAnalytics(@Param('quizId') quizId: number) {
    return await this.quizService.getQuizAnalytics(quizId);
  }

  @Post(':quizId/submit')
  async submitAnswers(
    @Param('quizId') quizId: number,
    @Body() submitAnswerDto: SubmitAnswerDto[],
  ) {
    // Note: You'll need to get userId from auth context in real implementation
    const userId = 'temp-user-id'; 
    return await this.quizService.submitQuizAnswers(quizId, userId, submitAnswerDto);
  }

  @Get(':quizId/results')
  async getResults(@Param('quizId') quizId: number) {
    return await this.quizService.getQuizResults(quizId);
  }

  @Get(':quizId/results/:userId')
  async getUserResults(
    @Param('quizId') quizId: number,
    @Param('userId') userId: string,
  ) {
    return await this.quizService.getQuizResults(quizId, userId);
  }
}