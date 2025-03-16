import { Injectable } from '@nestjs/common';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import {
  UpdateVoucherActiveDto,
  UpdateVoucherDto,
} from './dto/update-voucher.dto';
import { EventCommonService } from 'src/event-common/event-common.service';
import { VoucherRepository } from './repositories/voucher.repository';

@Injectable()
export class VoucherService {
  constructor(
    private readonly eventCommonService: EventCommonService,
    private readonly voucherRepository: VoucherRepository,
  ) {}

  async findAllShowings(eventId: string) {
    return await this.eventCommonService.findAllShowings(eventId);
  }

  async create(eventId: string, createVoucherDto: CreateVoucherDto) {
    return await this.voucherRepository.create({
      ...createVoucherDto,
      eventId,
    });
  }

  async list(eventId: any, paramPagination, { keyword }: any) {
    const condition = [];

    if (keyword) {
      keyword = new RegExp(
        keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'gi',
      );
      condition.push({
        $or: [
          { name: { $regex: keyword } },
          { bulkCodePrefix: { $regex: keyword } },
          { discountCode: { $regex: keyword } },
        ],
      });
    }

    const vouchers = await this.voucherRepository.pagination({
      conditions: {
        $and: [
          {
            eventId,
            ...(condition.length ? { $or: condition } : {}),
          },
        ],
      },
      ...paramPagination,
    });

    return vouchers;
  }

  async findOne(eventId: string, id: string) {
    return await this.voucherRepository.findOne({
      eventId,
      _id: id,
    });
  }

  async update(
    eventId: string,
    id: string,
    updateVoucherDto: UpdateVoucherDto,
  ) {
    return await this.voucherRepository.updateOne(
      {
        eventId,
        _id: id,
      },
      updateVoucherDto,
    );
  }

  async changeStatus(
    eventId: string,
    id: string,
    updateVoucherDto: UpdateVoucherActiveDto,
  ) {
    return await this.voucherRepository.updateOne(
      {
        eventId,
        _id: id,
      },
      updateVoucherDto,
    );
  }

  async remove(eventId: string, id: string) {
    return await this.voucherRepository.deleteOne({
      eventId,
      _id: id,
    });
  }
}
