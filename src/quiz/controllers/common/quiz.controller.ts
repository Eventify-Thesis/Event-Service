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

  @MessagePattern('quiz.getShowQuizPublic')
  async getShowQuizPublic(@Payload() payload: { showId: number }) {
    return await this.quizService.findByShow(payload.showId);
  }

  @MessagePattern('quiz.submitAnswer') 
  async submitAnswer(
    @Payload() payload: { 
      questionId: number;
      selectedOption: number;
      userId: string;
      timeTaken?: number;
    }
  ) {
    return await this.quizService.submitAnswer(
      payload.questionId,
      payload.selectedOption,
      payload.userId,
      payload.timeTaken || 0
    );
  }

  @MessagePattern('quiz.getResults')
  async getQuizResults(
    @Payload() payload: { showId: number, userId: string }
  ) {
    return await this.quizService.getResults(payload.showId, payload.userId);
  }

  @MessagePattern('quiz.getLeaderboard')
  async getLeaderboard(
    @Payload() payload: { showId: number }
  ) {
    return await this.quizService.getLeaderboard(payload.showId);
  }
}