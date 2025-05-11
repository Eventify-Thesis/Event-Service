import { Controller, Post, Body, Get, Param, UseGuards, Put, Patch, Delete, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ClerkAuthGuard } from '../../../auth/clerk-auth.guard';
import EventRole from '../../../auth/event-role/event-roles.enum';
import EventRoleGuard from '../../../auth/event-role/event-roles.guards';
import { QuizService } from '../../services/quiz.service';
import { CreateQuizDto } from '../../dto/create-quiz.dto';
import { UpdateQuizDto } from 'src/quiz/dto/update-quiz.dto';
import { SubmitAnswerDto } from '../../dto/submit-answer.dto';
import { CreateQuizQuestionDto } from 'src/quiz/dto/create-quiz-question.dto';
import { UpdateQuizQuestionDto } from 'src/quiz/dto/update-quiz-question.dto';
import { EventExists } from 'src/event/pipes/event-exists.pipe';
import { QuizListQuery } from 'src/quiz/dto/quiz.query';

@Controller('planner/events/:eventId/quizzes')
@UseGuards(ClerkAuthGuard, EventRoleGuard([EventRole.OWNER, EventRole.ADMIN, EventRole.MANAGER]))
@ApiTags('Quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) { }

  @Post('shows/:showId')
  async create(
    @Param('eventId', EventExists) eventId: number,
    @Param('showId') showId: number, @Body() createQuizDto: CreateQuizDto) {
    return await this.quizService.create(eventId, { ...createQuizDto, showId });
  }

  @Get('')
  async findAll(@Param('eventId', EventExists) eventId: number, @Query() query: QuizListQuery) {
    return await this.quizService.findAll({
      eventId,
      ...query
    });
  }

  @Get(':quizId')
  async findOne(@Param('quizId') quizId: number) {
    return await this.quizService.findById(quizId);
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

  @Post(':quizId/questions')
  async createQuestion(
    @Param('quizId') quizId: number,
    @Body() questionData: CreateQuizQuestionDto
  ) {
    return await this.quizService.createQuestion(quizId, questionData);
  }

  @Get(':quizId/questions')
  async getQuestions(@Param('quizId') quizId: number) {
    return await this.quizService.getQuestions(quizId);
  }

  @Get(':quizId/questions/:questionId')
  async getQuestion(@Param('questionId') questionId: number) {
    return await this.quizService.getQuestion(questionId);
  }

  @Put(':quizId/questions/:questionId')
  async updateQuestion(
    @Param('quizId') quizId: number,
    @Param('questionId') questionId: number,
    @Body() questionData: UpdateQuizQuestionDto
  ) {
    return await this.quizService.updateQuestion(quizId, questionId, questionData);
  }

  @Delete(':quizId/questions/:questionId')
  async deleteQuestion(@Param('questionId') questionId: number) {
    return await this.quizService.deleteQuestion(questionId);
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