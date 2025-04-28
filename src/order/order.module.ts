import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { PlannerOrderController } from './controllers/planner/order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), EmailModule],
  controllers: [PlannerOrderController],
  providers: [OrderService],
})
export class OrderModule { }
