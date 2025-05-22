import {
  Controller,
  Param,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { QuizService } from '../../services/quiz.service';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SubmitAnswerDto } from '../../dto/submit-answer.dto';
import { QuizUserService } from '../../services/quiz-user.service';
import { QuizRedisService } from '../../services/quiz-redis.service';
import { ClerkAuthGuard } from '../../../auth/clerk-auth.guard';
import RequestWithUser from 'src/auth/role/requestWithUser.interface';

@Controller('quizzes')
@ApiTags('Quiz (Common)')
export class QuizController {
  constructor(
    private readonly quizService: QuizService,
    private readonly quizUserService: QuizUserService,
    private readonly quizRedisService: QuizRedisService,
  ) {}

  @Get('verify-code/:code')
  @ApiOperation({ summary: 'Verify a quiz join code' })
  @ApiParam({ name: 'code', description: 'Join code (6 digits)', type: String })
  @ApiResponse({
    status: 200,
    description: 'Returns whether the code is valid and the quiz ID if valid',
  })
  async verifyJoinCode(@Param('code') code: string) {
    return this.quizRedisService.verifyJoinCode(code);
  }

  // @Get(':quizId/question/:index')
  // @ApiOperation({ summary: 'Get a specific question by index' })
  // @ApiParam({ name: 'quizId', description: 'Quiz ID', type: Number })
  // @ApiParam({ name: 'index', description: 'Question index', type: Number })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Returns the question at specified index',
  // })
  // async getQuestionByIndex(
  //   @Param('quizId', ParseIntPipe) quizId: number,
  //   @Param('index', ParseIntPipe) index: number,
  // ) {
  //   return this.quizUserService.getCurrentQuestion(quizId, index);
  // }

  // @Post('answer/submit')
  // @UseGuards(ClerkAuthGuard)
  // @ApiOperation({ summary: 'Submit an answer to a quiz question' })
  // @ApiResponse({ status: 200, description: 'Returns answer result' })
  // async submitAnswer(
  //   @Body() dto: SubmitAnswerDto,
  //   @Req() req: RequestWithUser,
  // ) {
  //   const userId = req.user.id;
  //   return this.quizUserService.submitAnswer(dto, userId);
  // }

  // @Get(':quizId/progress')
  // @UseGuards(ClerkAuthGuard)
  // @ApiOperation({ summary: 'Get user quiz progress' })
  // @ApiParam({ name: 'quizId', description: 'Quiz ID', type: Number })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Returns user progress in the quiz',
  // })
  // async getProgress(
  //   @Param('quizId', ParseIntPipe) quizId: number,
  //   @Req() req: RequestWithUser,
  // ) {
  //   const userId = req.user.id;
  //   return this.quizUserService.getQuizProgress(quizId, userId);
  // }

  // @Get(':quizId/leaderboard')
  // @ApiOperation({ summary: 'Get quiz leaderboard' })
  // @ApiParam({ name: 'quizId', description: 'Quiz ID', type: Number })
  // @ApiQuery({
  //   name: 'limit',
  //   required: false,
  //   description: 'Number of results to return',
  // })
  // @ApiResponse({ status: 200, description: 'Returns quiz leaderboard' })
  // async getLeaderboard(
  //   @Param('quizId', ParseIntPipe) quizId: number,
  //   @Query('limit') limit?: number,
  // ) {
  //   return this.quizUserService.getLeaderboardSnapshot(
  //     quizId,
  //     limit ? parseInt(limit.toString()) : 10,
  //   );
  // }

  // @Get(':quizId/results')
  // @UseGuards(ClerkAuthGuard)
  // @ApiOperation({ summary: 'Get user quiz results' })
  // @ApiParam({ name: 'quizId', description: 'Quiz ID', type: Number })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Returns user results for the quiz',
  // })
  // async getResults(
  //   @Param('quizId', ParseIntPipe) quizId: number,
  //   @Req() req: RequestWithUser,
  // ) {
  //   const userId = req.user.id;
  //   return this.quizService.getQuizResults(quizId, userId);
  // }
}
