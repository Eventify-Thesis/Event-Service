import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Voucher } from './entities/voucher.entity';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { UpdateVoucherActiveDto } from './dto/update-voucher.dto';
import { EventCommonService } from 'src/event-common/event-common.service';

@Injectable()
export class VoucherService {
  constructor(
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,
    private readonly eventCommonService: EventCommonService,
  ) {}

  async findAllShowings(eventId: number) {
    return await this.eventCommonService.findAllShowings(eventId);
  }

  async create(eventId: number, createVoucherDto: CreateVoucherDto) {
    const voucher = this.voucherRepository.create({
      ...createVoucherDto,
      event: { id: eventId },
    });
    return await this.voucherRepository.save(voucher);
  }

  async list(eventId: number, paramPagination, { keyword }: any) {
    const queryBuilder = this.voucherRepository
      .createQueryBuilder('voucher')
      .where('voucher.eventId = :eventId', { eventId });

    if (keyword) {
      const searchKeyword = `%${keyword.trim()}%`;
      queryBuilder.andWhere(
        '(voucher.name ILIKE :keyword OR voucher.bulkCodePrefix ILIKE :keyword OR voucher.discountCode ILIKE :keyword)',
        { keyword: searchKeyword },
      );
    }

    const [vouchers, total] = await queryBuilder
      .skip((paramPagination.page - 1) * paramPagination.limit)
      .take(paramPagination.limit)
      .getManyAndCount();

    return {
      docs: vouchers,
      totalDocs: total,
      itemCount: vouchers.length,
      itemsPerPage: paramPagination.limit,
      totalPages: Math.ceil(total / paramPagination.limit),
      currentPage: paramPagination.page,
    };
  }

  async findOne(eventId: number, id: string) {
    return await this.voucherRepository.findOne({
      where: { event: { id: eventId }, id },
    });
  }

  async update(
    eventId: number,
    id: string,
    updateVoucherDto: UpdateVoucherDto,
  ) {
    await this.voucherRepository.update(
      { event: { id: eventId }, id },
      updateVoucherDto,
    );
    return this.findOne(eventId, id);
  }

  async changeStatus(
    eventId: number,
    id: string,
    updateVoucherDto: UpdateVoucherActiveDto,
  ) {
    await this.voucherRepository.update(
      { event: { id: eventId }, id },
      updateVoucherDto,
    );
    return this.findOne(eventId, id);
  }

  async remove(eventId: number, id: string) {
    await this.voucherRepository.delete({ event: { id: eventId }, id });
  }
}
