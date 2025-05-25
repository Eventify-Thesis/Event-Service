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
import { QuizUserService } from '../../services/quiz-user.service';
import { QuizRedisService } from '../../services/quiz-redis.service';
import { ClerkAuthGuard } from '../../../auth/clerk-auth.guard';

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
}
