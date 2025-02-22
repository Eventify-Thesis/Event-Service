import { PaginateModel } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import AbstractRepository from 'src/common/abstracts/repository.abstract';
import {
  PaymentInfo,
  PaymentInfoDocument,
} from '../entities/payment-info.entity';

@Injectable()
export class PaymentInfoRepository extends AbstractRepository<PaymentInfoDocument> {
  constructor(
    @InjectModel(PaymentInfo.name) model: PaginateModel<PaymentInfoDocument>,
  ) {
    super(model);
  }
}
