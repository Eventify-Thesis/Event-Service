import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PaymentInfo } from '../entities/payment-info.entity';

@Injectable()
export class PaymentInfoRepository extends Repository<PaymentInfo> {
  constructor(private dataSource: DataSource) {
    super(PaymentInfo, dataSource.createEntityManager());
  }
}
