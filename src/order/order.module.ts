import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { EmailModule } from 'src/email/email.module';
import { PlannerOrderController } from './controllers/planner/order.controller';
import { OrderController } from './controllers/user/order.controller';
import { PlannerOrderService } from './services/planner/order.service';
import { OrderService } from './services/user/order.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), EmailModule],
  controllers: [PlannerOrderController, OrderController],
  providers: [PlannerOrderService, OrderService],
})
export class OrderModule { }
