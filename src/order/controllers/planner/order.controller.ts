import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Res } from '@nestjs/common';
import { GetOrdersQuery } from '../../dto/get-orders.dto';
import EventRole from 'src/auth/event-role/event-roles.enum';
import EventRoleGuard from 'src/auth/event-role/event-roles.guards';
import { ApiQuery } from '@nestjs/swagger';
import { EventExists } from 'src/event/pipes/event-exists.pipe';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';
import { PlannerOrderService } from 'src/order/services/planner/order.service';

@Controller('planner/events/:eventId/orders')
@UseGuards(EventRoleGuard([EventRole.OWNER, EventRole.ADMIN]))
export class PlannerOrderController {
  constructor(private readonly orderService: PlannerOrderService) { }

  @Get('list')
  @ApiQuery({
    type: GetOrdersQuery,
  })
  findAll(
    @Param('eventId', EventExists) eventId: number,
    @Query() query: GetOrdersQuery,
  ) {
    return this.orderService.findAll(eventId, query);
  }

  @Get(':orderId')
  getDetail(@Param('orderId') orderId: number) {
    return this.orderService.getDetail(orderId);
  }

  @Post('export')
  async exportOrders(
    @Param('eventId', EventExists) eventId: number,
    @Res() res: Response
  ) {
    const orders = await this.orderService.exportOrders(eventId);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Orders');

    // Define columns
    worksheet.columns = [
      { header: 'First Name', key: 'firstName', width: 15 },
      { header: 'Last Name', key: 'lastName', width: 15 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Status', key: 'status', width: 10 },
      { header: 'Total Amount', key: 'totalAmount', width: 15 },
      { header: 'Discount Amount', key: 'discountAmount', width: 15 },
      { header: 'Created At', key: 'createdAt', width: 20 },
    ];

    // Add data rows
    orders.forEach(order => {
      worksheet.addRow({
        firstName: order.firstName ?? 'N/A',
        lastName: order.lastName ?? 'N/A',
        email: order.email ?? 'N/A',
        status: order.status,
        createdAt: order.createdAt,
        totalAmount: order.totalAmount ?? 0,
        discountAmount: order.platformDiscountAmount ?? 0
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=orders.xlsx',
    );

    await workbook.xlsx.write(res);
    res.end();
  }

  @Post(':orderId/resend-confirmation')
  async sendConfirmation(@Param('orderId') orderId: number, @Param('eventId') eventId: number) {
    return this.orderService.sendConfirmation(eventId, orderId);
  }
}
