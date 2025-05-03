import { GetOrdersQuery } from '../../dto/get-orders.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrderService } from 'src/order/services/user/order.service';
import { Controller } from '@nestjs/common';

@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @MessagePattern('getUserOrders')
  findAll(
    @Payload() data: { userId: string, query: GetOrdersQuery },
  ) {
    return this.orderService.getUserOrders(data.userId, data.query);
  }

  @MessagePattern('getOrderDetail')
  getDetail(@Payload() orderPublicId: string) {
    return this.orderService.getOrderDetail(orderPublicId);
  }
}
