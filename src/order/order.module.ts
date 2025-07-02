import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order, OrderItem } from './entities/order.entity';
import { EmailModule } from 'src/email/email.module';
import { PlannerOrderController } from './controllers/planner/order.controller';
import { OrderController } from './controllers/user/order.controller';
import { PlannerOrderService } from './services/planner/order.service';
import { OrderService } from './services/user/order.service';
import { OrderRepository } from './repositories/order.repository';
import { OrderItemRepository } from './repositories/order-item.repository';
import { BookingAnswerRepository } from './repositories/booking-answer.repository';
import { BookingAnswer } from './entities/booking-answer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order, 
      OrderItem, 
      BookingAnswer
    ]), 
    EmailModule
  ],
  controllers: [PlannerOrderController, OrderController],
  providers: [
    PlannerOrderService, 
    OrderService,
    OrderRepository,
    OrderItemRepository,
    BookingAnswerRepository,
  ],
  exports: [
    OrderRepository,
    OrderItemRepository,
    BookingAnswerRepository,
  ],
})
export class OrderModule { }
