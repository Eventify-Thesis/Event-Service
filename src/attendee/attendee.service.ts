import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Attendee } from './entities/attendees.entity';
import { EmailService } from 'src/email/email.service';
import * as ExcelJS from 'exceljs';
import { CreateAttendeeDto } from './dto/create-attendee.dto';
import { UpdateAttendeeDto } from './dto/update-attendee.dto';
import { AttendeeErrorMessages } from './attendee.constants';
import { TicketType } from 'src/event/entities/ticket-type.entity';
import { AttendeeListQuery, AttendeeListResponse } from './dto/attendee-list.dto';
import { Response } from 'express';
import { PassThrough } from 'stream';

@Injectable()
export class AttendeeService {
  private readonly logger = new Logger(AttendeeService.name);

  constructor(
    @InjectRepository(Attendee)
    private attendeeRepository: Repository<Attendee>,
    private dataSource: DataSource,
    private emailService: EmailService,
  ) { }

  async create(createAttendeeDto: CreateAttendeeDto & { eventId: number; publicId: string; shortId: string }): Promise<Attendee> {
    return await this.dataSource.transaction(async (manager) => {
      // Check ticket type quantity
      const ticketType = await manager.findOne(TicketType, {
        where: { id: createAttendeeDto.ticketTypeId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!ticketType) {
        throw new Error(AttendeeErrorMessages.TICKET_TYPE_NOT_FOUND);
      }

      if (ticketType.quantity <= ticketType.soldQuantity) {
        throw new Error(AttendeeErrorMessages.TICKET_QUANTITY_EXCEEDED);
      }

<<<<<<< HEAD
      console.log('here here ', ticketType)

=======
>>>>>>> db07fdf816c06999cd1af3e0ba4aba01c15b5376
      // Create attendee
      const attendee = manager.create(Attendee, createAttendeeDto);
      await manager.save(attendee);

      // Increment sold quantity
      await manager.increment(
        TicketType,
        { id: createAttendeeDto.ticketTypeId },
        'soldQuantity',
        1
      );

      return attendee;
    });
  }

  async update(id: number, updateAttendeeDto: UpdateAttendeeDto & { eventId?: number }): Promise<Attendee> {
    return await this.dataSource.transaction(async (manager) => {
      const attendee = await manager.findOne(Attendee, {
        where: { id },
        relations: ['ticketType'],
      });

      if (!attendee) {
        throw new NotFoundException(AttendeeErrorMessages.ATTENDEE_NOT_FOUND(id));
      }

      // If ticket type is being changed, check quantity
      if (updateAttendeeDto.ticketTypeId && updateAttendeeDto.ticketTypeId !== attendee.ticketTypeId) {
        const newTicketType = await manager.findOne(TicketType, {
          where: { id: updateAttendeeDto.ticketTypeId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!newTicketType) {
          throw new Error(AttendeeErrorMessages.NEW_TICKET_TYPE_NOT_FOUND);
        }

        if (newTicketType.quantity <= newTicketType.soldQuantity) {
          throw new Error(AttendeeErrorMessages.TICKET_QUANTITY_EXCEEDED);
        }

        // Decrement old ticket type quantity
        await manager.decrement(
          TicketType,
          { id: attendee.ticketTypeId },
          'soldQuantity',
          1
        );

<<<<<<< HEAD

=======
>>>>>>> db07fdf816c06999cd1af3e0ba4aba01c15b5376
        // Increment new ticket type quantity
        await manager.increment(
          TicketType,
          { id: updateAttendeeDto.ticketTypeId },
          'soldQuantity',
          1
        );
      }

      // Update attendee
      Object.assign(attendee, updateAttendeeDto);
      return await manager.save(attendee);
    });
  }

  async findAll(eventId: number, query: AttendeeListQuery): Promise<{ docs: AttendeeListResponse[]; totalPages: number; totalDocs: number }> {
    const qb = this.attendeeRepository.createQueryBuilder('attendee')
      .where('attendee.eventId = :eventId', { eventId })
      .leftJoinAndSelect('attendee.ticketType', 'ticketType')
      .leftJoinAndSelect('attendee.order', 'order');

    // Apply search
    if (query.keyword) {
      qb.andWhere('(attendee.firstName ILIKE :search OR attendee.lastName ILIKE :search OR attendee.email ILIKE :search OR attendee.publicId ILIKE :search)', {
        search: `%${query.keyword}%`,
      });
    }

    // Apply check-in filter
    if (typeof query.isCheckedIn === 'boolean') {
      if (query.isCheckedIn) {
        qb.andWhere('attendee.checkedInAt IS NOT NULL AND attendee.checkedOutAt IS NULL');
      } else {
        qb.andWhere('(attendee.checkedInAt IS NULL OR attendee.checkedOutAt IS NOT NULL)');
      }
    }

    // Apply sorting
    // if (query.sort) {
    //   const sorts = query.sort.split(' ');
    //   sorts.forEach(sort => {
    //     const [field, direction] = sort.split('.');
    //     const validFields = ['firstName', 'lastName', 'email', 'createdAt', 'checkedInAt'];
    //     if (validFields.includes(field)) {
    //       qb.addOrderBy(`attendee.${field}`, direction.toUpperCase() as 'ASC' | 'DESC');
    //     }
    //   });
    // } else {
    //   qb.orderBy('attendee.createdAt', 'DESC');
    // }

    // Apply pagination
    const skip = (query.page - 1) * query.limit;
    qb.skip(skip).take(query.limit);

    const [items, total] = await qb.getManyAndCount();

    // Transform to response DTO
    const transformedItems: AttendeeListResponse[] = items.map(attendee => ({
      id: attendee.id,
      publicId: attendee.publicId,
      shortId: attendee.shortId,
      firstName: attendee.firstName,
      lastName: attendee.lastName,
      email: attendee.email,
      ticketType: {
        id: attendee.ticketType?.id,
        name: attendee.ticketType?.name,
      },
      order: {
        id: attendee.order?.id,
        publicId: attendee.order?.publicId,
      },
      isCheckedIn: Boolean(attendee.checkedInAt && !attendee.checkedOutAt),
      checkedInAt: attendee.checkedInAt,
      createdAt: attendee.createdAt,
      updatedAt: attendee.updatedAt,
    }));

    return {
      docs: transformedItems,
      totalPages: Math.ceil(total / query.limit),
      totalDocs: total,
    };
  }

  async findOne(id: number, eventId: number): Promise<Attendee> {
    const attendee = await this.attendeeRepository.createQueryBuilder('attendee')
      .where('attendee.id = :id', { id })
      .andWhere('attendee.eventId = :eventId', { eventId })
      .leftJoinAndSelect('attendee.ticketType', 'ticketType')
      .leftJoinAndSelect('attendee.order', 'order')
      .leftJoinAndSelect('attendee.bookingAnswer', 'bookingAnswer')
      .leftJoinAndSelect('bookingAnswer.question', 'question')
      .getOne();

    if (!attendee) {
      throw new NotFoundException(AttendeeErrorMessages.ATTENDEE_NOT_FOUND(id));
    }

    return attendee;
  }

  async checkIn(eventId: number, publicId: string, action: 'check_in' | 'check_out'): Promise<Attendee> {
    const attendee = await this.attendeeRepository.findOne({
      where: { eventId, publicId },
    });

    if (!attendee) {
      throw new NotFoundException(AttendeeErrorMessages.ATTENDEE_NOT_FOUND_BY_PUBLIC_ID(publicId));
    }

    if (action === 'check_in') {
      attendee.checkedInAt = new Date();
      attendee.checkedOutAt = null;
    } else {
      attendee.checkedOutAt = new Date();
    }

    return await this.attendeeRepository.save(attendee);
  }

  async export(eventId: number, res: Response): Promise<void> {
    const attendees = await this.attendeeRepository.find({
      where: { eventId },
      relations: ['ticketType', 'order'],
      order: { createdAt: 'DESC' },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendees');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Public ID', key: 'publicId', width: 15 },
      { header: 'First Name', key: 'firstName', width: 20 },
      { header: 'Last Name', key: 'lastName', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Ticket Type', key: 'ticketType', width: 20 },
      { header: 'Order ID', key: 'orderId', width: 15 },
      { header: 'Checked In', key: 'isCheckedIn', width: 12 },
      { header: 'Checked In At', key: 'checkedInAt', width: 20 },
      { header: 'Created At', key: 'createdAt', width: 20 },
    ];

    attendees.forEach((attendee) => {
      worksheet.addRow({
        id: attendee.id ?? 'N/A',
        publicId: attendee.publicId ?? 'N/A',
        firstName: attendee.firstName ?? 'N/A',
        lastName: attendee.lastName ?? 'N/A',
        email: attendee.email ?? 'N/A',
        ticketType: attendee.ticketType?.name ?? 'N/A',
        orderId: attendee.order?.publicId ?? 'N/A',
        isCheckedIn: attendee.checkedInAt && !attendee.checkedOutAt ? 'Yes' : 'No',
        checkedInAt: attendee.checkedInAt ? new Date(attendee.checkedInAt).toLocaleString() : 'N/A',
        createdAt: attendee.createdAt ? new Date(attendee.createdAt).toLocaleString() : 'N/A',
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=attendees-${eventId}-${Date.now()}.xlsx`,
    );

    const passThrough = new PassThrough();
    workbook.xlsx.write(passThrough);
    passThrough.pipe(res);
    passThrough.end();
  }

  async resendTicket(eventId: number, attendeeId: number): Promise<void> {
    const attendee = await this.attendeeRepository.findOne({
      where: { id: attendeeId, eventId },
      relations: ['ticketType', 'order'],
    });

    if (!attendee) {
      throw new NotFoundException(AttendeeErrorMessages.ATTENDEE_NOT_FOUND(attendeeId));
    }

    // await this.emailService.sendTicket(attendee);
  }
}
