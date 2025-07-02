import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VoucherService } from './voucher.service';
import { PlannerVoucherController } from './controllers/planner/voucher.controller';
import { Voucher } from './entities/voucher.entity';
import { EventCommonModule } from 'src/event-common/event-common.module';
import { VoucherRepository } from './repositories/voucher.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Voucher]), 
    EventCommonModule
  ],
  controllers: [PlannerVoucherController],
  providers: [
    VoucherService,
    VoucherRepository
  ],
  exports: [
    VoucherService,
    VoucherRepository
  ],
})
export class VoucherModule {}
