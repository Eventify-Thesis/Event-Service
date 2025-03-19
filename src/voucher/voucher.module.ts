import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VoucherService } from './voucher.service';
import { PlannerVoucherController } from './controllers/planner/voucher.controller';
import { Voucher } from './entities/voucher.entity';
import { EventCommonModule } from 'src/event-common/event-common.module';

@Module({
  imports: [TypeOrmModule.forFeature([Voucher]), EventCommonModule],
  controllers: [PlannerVoucherController],
  providers: [VoucherService],
  exports: [VoucherService],
})
export class VoucherModule {}
