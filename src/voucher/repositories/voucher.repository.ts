import { PaginateModel } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import AbstractRepository from 'src/common/abstracts/repository.abstract';
import { Voucher, VoucherDocument } from '../entities/voucher.entity';

@Injectable()
export class VoucherRepository extends AbstractRepository<VoucherDocument> {
  constructor(
    @InjectModel(Voucher.name) model: PaginateModel<VoucherDocument>,
  ) {
    super(model);
  }
}
