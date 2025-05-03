import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CheckInList } from '../entities/check-in-list.entity';
import { AttendeeCheckIn } from '../entities/attendee-check-in.entity';
import { CannotCheckInException } from '../exceptions/cannot-check-in.exception';
import { Attendee } from 'src/attendee/entities/attendees.entity';
import { IdHelper } from 'src/common/helper/id-helper';
import { CheckInAttendeeQuery } from '../dto/check-in-list.dto';

@Injectable()
export class CheckInService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) { }

  async getCheckInList(eventId: number, shortId: string) {
    const result = await this.dataSource
      .getRepository(CheckInList)
      .createQueryBuilder('checkInList')
      .where('checkInList.eventId = :eventId AND checkInList.shortId = :shortId', { eventId, shortId })
      .leftJoinAndSelect('checkInList.ticketTypes', 'ticketTypes')
      .leftJoinAndSelect('checkInList.show', 'show')
      .leftJoin('attendees', 'attendees', 'attendees.ticket_type_id IN (ticketTypes.id)')
      .leftJoin('attendee_check_ins', 'ac', 'ac.attendee_id = attendees.id AND ac.deleted_at IS NULL')
      .addSelect('COUNT(DISTINCT CASE WHEN ac.id IS NOT NULL THEN attendees.id END)', 'checkedInAttendees')
      .addSelect('COUNT(DISTINCT attendees.id)', 'totalAttendees')
      .groupBy('checkInList.id')
      .addGroupBy('ticketTypes.id')
      .addGroupBy('show.id')
      .getRawAndEntities();

    if (!result.entities[0]) {
      throw new NotFoundException('Check-in list not found');
    }

    return {
      ...result.entities[0],
      checkedInAttendees: parseInt(result.raw[0].checkedInAttendees) || 0,
      totalAttendees: parseInt(result.raw[0].totalAttendees) || 0,
      isActive: result.entities[0].activatesAt <= new Date() && result.entities[0].expiresAt >= new Date(),
      isExpired: result.entities[0].expiresAt < new Date(),
    };
  }


  async getCheckInListAttendees(
    eventId: number,
    checkInListId: number,
    query: CheckInAttendeeQuery,
  ) {
    let params: any[] = [checkInListId, Number(eventId)];
    let searchCondition = '';

    if (query.keyword) {
      searchCondition = 'AND (a.first_name ILIKE $3 OR a.last_name ILIKE $3 OR a.public_id ILIKE $3 OR a.email ILIKE $3)';
      params.push(`%${query.keyword}%`);
    }

    const countQuery = `
      SELECT COUNT(*)
      FROM attendees a
      INNER JOIN ticket_check_in_lists tcl ON tcl.ticket_type_id = a.ticket_type_id
      WHERE tcl.check_in_list_id = $1
      AND a.event_id = $2
      AND a.deleted_at IS NULL
      ${searchCondition}
    `;

    const countResult = await this.dataSource.query(countQuery, params);
    const total = parseInt(countResult[0].count, 10);

    const itemsQuery = `
      SELECT 
        a.id as "id",
        a.first_name as "firstName",
        a.last_name as "lastName",
        a.public_id as "publicId",
        a.email as "email",
        a.ticket_type_id as "ticketTypeId",
        CASE 
          WHEN ac.id IS NOT NULL THEN
            jsonb_build_object(
              'id', ac.id,
              'shortId', ac.short_id,
              'createdAt', ac.created_at,
              'deletedAt', ac.deleted_at
            )
          ELSE NULL
        END as "checkIn",
        jsonb_build_object(
          'id', tt.id,
          'name', tt.name
        ) as "ticketType"
      FROM attendees a
      INNER JOIN ticket_check_in_lists tcl ON tcl.ticket_type_id = a.ticket_type_id
      LEFT JOIN attendee_check_ins ac ON ac.attendee_id = a.id AND ac.deleted_at IS NULL
      LEFT JOIN ticket_types tt ON tt.id = a.ticket_type_id
      WHERE tcl.check_in_list_id = $1
      AND a.event_id = $2
      AND a.deleted_at IS NULL
      ${searchCondition}
      ORDER BY a.first_name ASC, a.last_name ASC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const items = await this.dataSource.query(
      itemsQuery,
      [...params, query.limit, (query.page - 1) * query.limit],
    );

    return {
      items,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  async createCheckIn(
    eventId: number,
    checkInListShortId: string,
    attendeePublicIds: string[],
    ipAddress: string,
  ) {
    const checkInList = await this.getCheckInList(eventId, checkInListShortId);
    if (!checkInList) {
      throw new CannotCheckInException('Check-in list not found');
    }

    await this.validateCheckInListIsActive(checkInList);

    const attendees = await this.dataSource
      .getRepository(Attendee)
      .createQueryBuilder('attendee')
      .where('attendee.publicId IN (:...attendeePublicIds)', { attendeePublicIds })
      .andWhere('attendee.eventId = :eventId', { eventId })
      .getMany();

    const existingCheckIns = await this.dataSource
      .getRepository(AttendeeCheckIn)
      .createQueryBuilder('checkIn')
      .where('checkIn.attendeeId IN (:...attendeeIds)', {
        attendeeIds: attendees.map((a) => a.id),
      })
      .andWhere('checkIn.eventId = :eventId', { eventId })
      .getMany();

    const errors = {};
    const checkIns = [];

    for (const attendee of attendees) {
      const existingCheckIn = existingCheckIns.find(
        (c) => c.attendeeId === attendee.id,
      );

      if (attendee.status === 'CANCELLED') {
        errors[attendee.publicId] = `Attendee ${attendee.firstName}'s ticket is cancelled`;
        continue;
      }

      if (existingCheckIn) {
        checkIns.push(existingCheckIn);
        errors[attendee.publicId] = `Attendee ${attendee.firstName} is already checked in`;
        continue;
      }

      const checkIn = await this.dataSource.getRepository(AttendeeCheckIn).save({
        attendeeId: attendee.id,
        checkInListId: checkInList.id,
        ipAddress,
        ticketTypeId: attendee.ticketTypeId,
        shortId: IdHelper.shortId(IdHelper.CHECK_IN_PREFIX),
        eventId: checkInList.eventId,
        showId: checkInList.showId,
      });

      checkIns.push(checkIn);
    }

    return {
      data: checkIns,
      errors,
    };
  }

  async deleteCheckIn(
    eventId: number,
    checkInListShortId: string,
    checkInShortId: string,
  ) {
    const checkInList = await this.getCheckInList(eventId, checkInListShortId);
    if (!checkInList) {
      throw new CannotCheckInException('Check-in list not found');
    }

    await this.validateCheckInListIsActive(checkInList);

    const checkIn = await this.dataSource
      .getRepository(AttendeeCheckIn)
      .createQueryBuilder('checkIn')
      .where('checkIn.shortId = :checkInShortId', { checkInShortId })
      .andWhere('checkIn.checkInListId = :checkInListId', {
        checkInListId: checkInList.id,
      })
      .getOne();

    if (!checkIn) {
      throw new CannotCheckInException('Check-in not found');
    }

    await this.dataSource.getRepository(AttendeeCheckIn).softDelete(checkIn.id);

    return { data: checkIn };
  }

  private async validateCheckInListIsActive(checkInList: CheckInList) {
    const now = new Date();

    if (checkInList.expiresAt && checkInList.expiresAt < now) {
      throw new CannotCheckInException('Check-in list has expired');
    }

    if (checkInList.activatesAt && checkInList.activatesAt > now) {
      throw new CannotCheckInException('Check-in list is not active yet');
    }
  }
}
