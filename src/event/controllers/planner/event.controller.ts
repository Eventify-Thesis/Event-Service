import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { BodyParamUser } from 'src/common/decorators/body-param-user.decorator';
import { successResponse } from 'src/common/docs/response.doc';
import { CreateDraftEventDto } from 'src/event/dto/create-draft-event.dto';
import { UpdateEventSettingDto } from 'src/event/dto/update-event-setting.dto';
import { EventService } from 'src/event/event.service';
import { EventBodyExists } from 'src/event/pipes/event-body-exists.pipe';
import { EventExists } from 'src/event/pipes/event-exists.pipe';

@Controller({
  path: 'planner/events',
})
export class PlannerEventController {
  constructor(private readonly eventService: EventService) {}

  @Post('draft')
  async upsert(
    @Body(EventBodyExists) createDraftEventDto: CreateDraftEventDto,
  ) {
    return await this.eventService.upsert(createDraftEventDto);
  }

  @Put(':id/settings')
  @ApiOkResponse(successResponse)
  async updateSetting(
    @Body() updateEventSettingDto: UpdateEventSettingDto,
    @Param('id', EventExists) eventId: string,
  ) {
    await this.eventService.updateSetting(eventId, updateEventSettingDto);
    return {
      status: 'success',
    };
  }

  @Put(':id/payment-info')
  @ApiOkResponse(successResponse)
  async updatePaymentInfo(
    @Body() updatePaymentInfoDto: any,
    @Param('id', EventExists) eventId: string,
  ) {
    await this.eventService.updatePaymentInfo(eventId, updatePaymentInfoDto);
    return {
      status: 'success',
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
  //   return this.eventService.update(+id, updateEventDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventService.remove(+id);
  }
}
