import { Body, Controller, Get, HttpException, HttpStatus, Param, ParseIntPipe, Patch, Post, Put, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { AttendeeService } from './attendee.service';
import { IdHelper } from 'src/common/helper/id-helper';
import { CreateAttendeeDto } from './dto/create-attendee.dto';
import { UpdateAttendeeDto } from './dto/update-attendee.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AttendeeErrorMessages, AttendeeSuccessMessages } from './attendee.constants';
import { AttendeeListQuery, AttendeeListResponse } from './dto/attendee-list.dto';
import { EventExists } from 'src/event/pipes/event-exists.pipe';
import * as ExcelJS from 'exceljs';

@ApiTags('Attendees')
@Controller('planner/events/:eventId/attendees')
export class AttendeeController {
  constructor(private readonly attendeeService: AttendeeService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new attendee' })
  @ApiResponse({ status: 201, description: 'The attendee has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Invalid input or ticket quantity exceeded.' })
  async create(
    @Param('eventId', EventExists) eventId: number,
    @Body() createAttendeeDto: CreateAttendeeDto,
  ) {
    try {
      const attendee = await this.attendeeService.create({
        ...createAttendeeDto,
        eventId,
        publicId: IdHelper.publicId(IdHelper.ATTENDEE_PREFIX),
        shortId: IdHelper.shortId(IdHelper.ATTENDEE_PREFIX),
      });

      return { data: attendee };
    } catch (error) {
      if (error.message.includes('ticket quantity')) {
        throw new HttpException(
          AttendeeErrorMessages.TICKET_QUANTITY_EXCEEDED,
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        AttendeeErrorMessages.CREATE_FAILED(error.message),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':attendeeId')
  @ApiOperation({ summary: 'Update an attendee' })
  @ApiResponse({ status: 200, description: 'The attendee has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Invalid input or ticket quantity exceeded.' })
  async update(
    @Param('eventId', EventExists) eventId: number,
    @Param('attendeeId', ParseIntPipe) attendeeId: number,
    @Body() updateAttendeeDto: UpdateAttendeeDto,
  ) {
    try {
      const attendee = await this.attendeeService.update(attendeeId, {
        ...updateAttendeeDto,
        eventId,
      });

      return { data: attendee };
    } catch (error) {
      if (error.message.includes('ticket quantity')) {
        throw new HttpException(
          AttendeeErrorMessages.TICKET_QUANTITY_EXCEEDED,
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        AttendeeErrorMessages.UPDATE_FAILED(error.message),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':attendeeId')
  @ApiOperation({ summary: 'Partially update an attendee' })
  @ApiResponse({ status: 200, description: 'The attendee has been successfully modified.' })
  @ApiResponse({ status: 400, description: 'Invalid input or ticket quantity exceeded.' })
  async modify(
    @Param('eventId', EventExists) eventId: number,
    @Param('attendeeId', ParseIntPipe) attendeeId: number,
    @Body() updateAttendeeDto: UpdateAttendeeDto,
  ) {
    try {
      const attendee = await this.attendeeService.update(attendeeId, {
        ...updateAttendeeDto,
        eventId,
      });

      return { data: attendee };
    } catch (error) {
      if (error.message.includes('ticket quantity')) {
        throw new HttpException(
          AttendeeErrorMessages.TICKET_QUANTITY_EXCEEDED,
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        AttendeeErrorMessages.MODIFY_FAILED(error.message),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all attendees' })
  @ApiResponse({ status: 200, description: 'Return all attendees.' })
  async findAll(
    @Param('eventId', EventExists) eventId: number,
    @Query() query: AttendeeListQuery,
  ) {
    try {
      return await this.attendeeService.findAll(eventId, query);
    } catch (error) {
      throw new HttpException(
        AttendeeErrorMessages.FETCH_ALL_FAILED(error.message),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':attendeeId')
  @ApiOperation({ summary: 'Get a single attendee' })
  @ApiResponse({ status: 200, description: 'Return the attendee.' })
  @ApiResponse({ status: 404, description: 'Attendee not found.' })
  async findOne(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Param('attendeeId', ParseIntPipe) attendeeId: number,
  ) {
    try {
      const attendee = await this.attendeeService.findOne(attendeeId, eventId);
      return attendee;
    } catch (error) {
      throw new HttpException(
        AttendeeErrorMessages.FETCH_FAILED(error.message),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':attendeePublicId/check_in')
  @ApiOperation({ summary: 'Check in/out an attendee' })
  @ApiResponse({ status: 200, description: 'The attendee has been checked in/out.' })
  @ApiResponse({ status: 404, description: 'Attendee not found.' })
  async checkIn(
    @Param('eventId', EventExists) eventId: number,
    @Param('attendeePublicId') attendeePublicId: string,
    @Body('action') action: 'check_in' | 'check_out',
  ) {
    try {
      const attendee = await this.attendeeService.checkIn(eventId, attendeePublicId, action);
      return { data: attendee };
    } catch (error) {
      throw new HttpException(
        AttendeeErrorMessages.CHECK_IN_FAILED(error.message),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('export')
  @ApiOperation({ summary: 'Export attendees to Excel' })
  @ApiResponse({ status: 200, description: 'Return the Excel file.' })
  async export(
    @Param('eventId', EventExists) eventId: number,
    @Res() res: Response,
  ) {
    try {
      const attendees = await this.attendeeService.findAll(eventId, {
        page: 1,
        limit: 1000,
        sort: 'createdAt'
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Attendees');

      // Define columns
      worksheet.columns = [
        { header: 'First Name', key: 'firstName', width: 15 },
        { header: 'Last Name', key: 'lastName', width: 15 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Ticket Type', key: 'ticketType', width: 20 },
        { header: 'Order ID', key: 'orderId', width: 15 },
        { header: 'Check-in Status', key: 'checkInStatus', width: 15 },
        { header: 'Created At', key: 'createdAt', width: 20 },
      ];

      // Add data rows
      attendees.docs.forEach(attendee => {
        worksheet.addRow({
          firstName: attendee.firstName ?? 'N/A',
          lastName: attendee.lastName ?? 'N/A',
          email: attendee.email ?? 'N/A',
          ticketType: attendee.ticketType?.name ?? 'N/A',
          orderId: attendee.order?.id ?? 'N/A',
          checkInStatus: attendee.checkedInAt ? 'Checked in' : 'Not checked in',
          createdAt: attendee.createdAt,
        });
      });

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=attendees.xlsx',
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      throw new HttpException(
        AttendeeErrorMessages.EXPORT_FAILED(error.message),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':attendeeId/resend-ticket')
  @ApiOperation({ summary: 'Resend ticket email to attendee' })
  @ApiResponse({ status: 200, description: 'The ticket email has been resent.' })
  @ApiResponse({ status: 404, description: 'Attendee not found.' })
  async resendTicket(
    @Param('eventId', EventExists) eventId: number,
    @Param('attendeeId', ParseIntPipe) attendeeId: number,
  ) {
    try {
      await this.attendeeService.resendTicket(eventId, attendeeId);
      return { message: AttendeeSuccessMessages.TICKET_RESENT };
    } catch (error) {
      throw new HttpException(
        AttendeeErrorMessages.RESEND_TICKET_FAILED(error.message),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
