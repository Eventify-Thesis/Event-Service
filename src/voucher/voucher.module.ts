import { Module } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { PlannerVoucherController } from './controllers/planner/voucher.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Voucher, VoucherSchema } from './entities/voucher.entity';
import { VoucherRepository } from './repositories/voucher.repository';
import { EventCommonModule } from 'src/event-common/event-common.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Voucher.name, schema: VoucherSchema }]),
    EventCommonModule,
  ],
  controllers: [PlannerVoucherController],
  providers: [VoucherService, VoucherRepository],
})
export class VoucherModule {}
