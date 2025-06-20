// src/event-stats/event-stats.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
import { EventStatistics } from '../entities/event-statistics.entity';
import { EventDailyStatistics } from '../entities/event-statistics.entity';
// import { Attendee } from 'src/bookings/entities/attendee.entity';
import {
  EventDailyStatsDto,
  CheckInStatsDto,
  EventStatsResponseDto,
} from '../dto/event-stats.dto';

@Injectable()
export class EventStatsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(EventStatistics)
    private readonly statsRepo: Repository<EventStatistics>,
    @InjectRepository(EventDailyStatistics)
    private readonly dailyStatsRepo: Repository<EventDailyStatistics>,
    // @InjectRepository(Attendee)
    // private readonly attendeeRepo: Repository<Attendee>,
  ) {}

  /**
   * Fetch event-level and daily statistics for a given event over a date range.
   * @param eventId
   * @param startDateStr Start date string (ISO format) or null for default
   * @param endDateStr End date string (ISO format) or null for default
   */
  async getEventStats(
    eventId: number,
    startDateStr?: string,
    endDateStr?: string,
  ): Promise<EventStatsResponseDto> {
    const endDate = endDateStr
      ? dayjs(endDateStr).tz('Asia/Bangkok').endOf('day').toDate()
      : dayjs().tz('Asia/Bangkok').endOf('day').toDate();
    const startDate = startDateStr
      ? dayjs(startDateStr).tz('Asia/Bangkok').startOf('day').toDate()
      : dayjs().tz('Asia/Bangkok').subtract(7, 'day').startOf('day').toDate();

    // Total aggregates
    const totals = await this.statsRepo
      .createQueryBuilder('es')
      .select([
        'COALESCE(SUM(es.ticketsSold), 0) AS "totalTicketsSold"',
        'COALESCE(SUM(es.ordersCreated), 0) AS "totalOrders"',
        'COALESCE(SUM(es.salesTotalGross), 0) AS "totalGrossSales"',
        'COALESCE(SUM(es.totalDiscount), 0) AS "totalDiscount"',
        'COALESCE(SUM(es.salesTotalNet), 0) AS "totalNetSales"',
        'COALESCE(SUM(es.totalViews), 0) AS "totalViews"',
      ])
      .where('es.eventId = :eventId', { eventId })
      .andWhere('es.deletedAt IS NULL')
      .getRawOne();

    // Daily series using generate_series with raw SQL
    const dailyQuery = `
      WITH date_series AS (
        SELECT date::date
        FROM generate_series(
          $1::date,
          $2::date,
          '1 day'
        ) AS gs(date)
      )
      SELECT
        ds.date,
        COALESCE(SUM(eds.sales_total_gross), 0) AS "totalSalesGross",
        COALESCE(SUM(eds.sales_total_net), 0) AS "totalSalesNet",
        COALESCE(SUM(eds.total_discount), 0) AS "totalDiscount",
        COALESCE(SUM(eds.tickets_sold), 0) AS "ticketsSold",
        COALESCE(SUM(eds.orders_created), 0) AS "ordersCreated",
        COALESCE(SUM(eds.total_views), 0) AS "totalViews"
      FROM date_series ds
      LEFT JOIN event_daily_statistics eds 
        ON ds.date = eds.date 
        AND eds.event_id = $3 
        AND eds.deleted_at IS NULL
      GROUP BY ds.date  
      ORDER BY ds.date ASC;
    `;

    const dailyRows = await this.dataSource.query(dailyQuery, [
      startDate,
      endDate,
      eventId,
    ]);

    const dailyStats: EventDailyStatsDto[] = dailyRows.map((row) => ({
      date: dayjs(row.date).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss'),
      totalDiscount: parseFloat(row.totalDiscount),
      totalSalesGross: parseFloat(row.totalSalesGross),
      totalSalesNet: parseFloat(row.totalSalesNet),
      ticketsSold: parseInt(row.ticketsSold, 10),
      ordersCreated: parseInt(row.ordersCreated, 10),
    }));

    return {
      dailyStats,
      startDate: dayjs(startDate)
        .tz('Asia/Bangkok')
        .format('YYYY-MM-DD HH:mm:ss'),
      endDate: dayjs(endDate).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss'),
      // checkInStats: {
      //   totalCheckInAttendees: parseInt(checkedInCount, 10),
      //   totalAttendees: parseInt(totalCount, 10),
      // },
      totalTicketsSold: parseInt(totals.totalTicketsSold, 10),
      totalOrders: parseInt(totals.totalOrders, 10),
      totalGrossSales: parseFloat(totals.totalGrossSales),
      totalNetSales: parseFloat(totals.totalNetSales),
      totalDiscount: parseFloat(totals.totalDiscount),
      totalViews: parseInt(totals.totalViews, 10),
    };
  }
}
