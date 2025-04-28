import { ApiProperty } from '@nestjs/swagger';
export class EventDailyStatsDto {
  @ApiProperty() date: string;
  @ApiProperty() totalDiscount: number;
  @ApiProperty() totalSalesGross: number;
  @ApiProperty() totalSalesNet: number;
  @ApiProperty() ticketsSold: number;
  @ApiProperty() ordersCreated: number;
}

export class CheckInStatsDto {
  @ApiProperty() totalCheckInAttendees: number;
  @ApiProperty() totalAttendees: number;
}

export class EventStatsResponseDto {
  @ApiProperty({ type: [EventDailyStatsDto] }) dailyStats: EventDailyStatsDto[];
  @ApiProperty() startDate: string;
  @ApiProperty() endDate: string;
  @ApiProperty({ type: CheckInStatsDto }) checkInStats?: CheckInStatsDto;
  @ApiProperty() totalTicketsSold: number;
  @ApiProperty() totalOrders: number;
  @ApiProperty() totalGrossSales: number;
  @ApiProperty() totalNetSales: number;
  @ApiProperty() totalDiscount: number;
  @ApiProperty() totalViews: number;
}
