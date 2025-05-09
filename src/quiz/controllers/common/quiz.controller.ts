import { 
  Controller, 
  Param, 
  Get, 
  Post, 
  Body, 
  Req
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { QuizService } from '../../services/quiz.service';
import { ApiTags } from '@nestjs/swagger';
import { SubmitAnswerDto } from '../../dto/submit-answer.dto';

@Controller('quiz')
@ApiTags('Quiz (Common)')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @MessagePattern('getShowQuiz')
  getShowQuiz(@Payload() showId: number) {
    return this.quizService.findByShow(showId);
  }

  @Get('shows/:showId')
  getShowQuizPublic(@Param('showId') showId: number) {
    return this.quizService.findByShow(showId);
  }

  @Post('questions/:questionId/answer')
  async submitAnswer(
    @Param('questionId') questionId: string,
    @Body() { selectedOption }: SubmitAnswerDto,
    @Req() req: any
  ) {
    return this.quizService.submitAnswer(
      questionId,
      selectedOption,
      req.auth.userId,
      0 // Default timeTaken value of 0 for now
    );
  }

  @Get('shows/:showId/results')
  async getQuizResults(
    @Param('showId') showId: number,
    @Req() req: any
  ) {
    return this.quizService.getResults(showId, req.auth.userId);
  }

  @Get('shows/:showId/leaderboard')
  async getLeaderboard(
    @Param('showId') showId: number
  ) {
    return this.quizService.getLeaderboard(showId);
  }
}