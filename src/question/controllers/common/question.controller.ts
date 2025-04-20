import {
  Controller,
  Param,

} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { QuestionService } from 'src/question/services/question.service';

@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) { }

  @MessagePattern('getEventQuestions')
  getEventQuestion(
    @Payload() id: number,
  ) {
    return this.questionService.findAllPublic(id);
  }
}
