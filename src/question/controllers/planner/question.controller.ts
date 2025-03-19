import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ClerkAuthGuard } from 'src/auth/clerk-auth.guard';
import EventRole from 'src/auth/event-role/event-roles.enum';
import EventRoleGuard from 'src/auth/event-role/event-roles.guards';
import { EventExists } from 'src/event/pipes/event-exists.pipe';
import { CreateQuestionDto } from 'src/question/dto/create-question.dto';
import { UpdateQuestionDto } from 'src/question/dto/update-question.dto';
import { QuestionService } from 'src/question/services/question.service';

@Controller('planner/events/:eventId/questions')
@UseGuards(ClerkAuthGuard)
@ApiBearerAuth()
export class PlannerQuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @UseGuards(
    EventRoleGuard([EventRole.ADMIN, EventRole.OWNER, EventRole.MANAGER]),
  )
  @Post()
  create(
    @Param('eventId', EventExists) eventId: string,
    @Body() createQuestionDto: CreateQuestionDto,
  ) {
    return this.questionService.create(eventId, createQuestionDto);
  }

  @Get()
  findAll(@Param('eventId', EventExists) eventId: string) {
    return this.questionService.findAll(eventId);
  }

  @Get(':id')
  findOne(
    @Param('eventId', EventExists) eventId: string,
    @Param('id') id: string,
  ) {
    return this.questionService.findOne(id, eventId);
  }

  @Patch(':id')
  update(
    @Param('eventId', EventExists) eventId: string,
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    console.log(updateQuestionDto);
    return this.questionService.update(id, eventId, updateQuestionDto);
  }

  @Post('sort')
  async updateOrder(@Body() sortedQuestionIds: any) {
    return this.questionService.updateOrder(
      sortedQuestionIds.sortedQuestionIds,
    );
  }

  @Delete(':id')
  remove(
    @Param('eventId', EventExists) eventId: string,
    @Param('id') id: string,
  ) {
    return this.questionService.remove(id, eventId);
  }
}
