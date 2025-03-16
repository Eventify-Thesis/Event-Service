import { ApiProperty } from '@nestjs/swagger';
import {
  VoucherCodeType,
  VoucherDiscountType,
  VoucherStatus,
} from '../voucher.constant';
export class VoucherListAllQuery {
  @ApiProperty({
    required: false,
    example: 10,
  })
  limit: number;

  @ApiProperty({
    required: false,
    example: 1,
  })
  page: number;

  @ApiProperty({
    required: false,
    example: 'name',
    description: 'Voucher Name',
  })
  keyword: string;

  @ApiProperty({
    required: false,
    example: 'name.desc createdAt.asc',
    description: 'name.desc createdAt.asc ',
  })
  sort: string;
}
export class VoucherListResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  discountType: VoucherDiscountType;

  @ApiProperty()
  discountValue: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  type: VoucherCodeType;

  @ApiProperty()
  status: VoucherStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class VoucherDetailResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  eventId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  active: boolean;

  @ApiProperty({ enum: VoucherCodeType })
  codeType: VoucherCodeType;

  @ApiProperty()
  bulkCodePrefix: string;

  @ApiProperty()
  bulkCodeNumber: number;

  @ApiProperty({ enum: VoucherDiscountType })
  discountType: VoucherDiscountType;

  @ApiProperty()
  discountValue: number;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  isUnlimited: boolean;

  @ApiProperty()
  maxOrderPerUser: number;

  @ApiProperty()
  minQtyPerOrder: number;

  @ApiProperty()
  maxQtyPerOrder: number;

  @ApiProperty()
  discountCode: string;

  @ApiProperty({ type: [Object] })
  showings: {
    id: string;
    isAllTickets: boolean;
    ticketIds: string[];
  }[];

  @ApiProperty()
  isAllShowings: boolean;

  @ApiProperty()
  source: number;

  @ApiProperty({ enum: VoucherStatus })
  status: VoucherStatus;

  @ApiProperty()
  startTime: Date;

  @ApiProperty()
  endTime: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
