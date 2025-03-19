import { EntityRepository, Repository } from 'typeorm';
import { Voucher } from '../entities/voucher.entity';

@EntityRepository(Voucher)
export class VoucherRepository extends Repository<Voucher> {}
