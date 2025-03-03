import { ApiProperty } from '@nestjs/swagger';
import { BusinessType, EventStatus } from '../event.constant';
import { IsEnum } from 'class-validator';
import EventRole from 'src/auth/event-role/event-roles.enum';

class TicketTypeResponse {
  @ApiProperty()
  name: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  isFree: boolean;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  minTicketPurchase: number;

  @ApiProperty()
  maxTicketPurchase: number;

  @ApiProperty()
  startTime: Date;

  @ApiProperty()
  endTime: Date;

  @ApiProperty()
  description: string;

  @ApiProperty()
  imageURL: string;

  @ApiProperty()
  isDisabled: boolean;

  @ApiProperty()
  position: number;
}

class ShowingResponse {
  @ApiProperty({ type: [TicketTypeResponse] })
  ticketTypes: TicketTypeResponse[];

  @ApiProperty()
  startTime: Date;

  @ApiProperty()
  endTime: Date;
}

export class SettingResponse {
  @ApiProperty()
  eventId: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  messageAttendees: string;

  @ApiProperty()
  isPrivate: boolean;

  @ApiProperty()
  eventDescription: string;
}

export class PaymentInfoResponse {
  @ApiProperty()
  eventId: string;

  @ApiProperty()
  bankAccount: string;

  @ApiProperty()
  bankAccountName: string;

  @ApiProperty()
  bankAccountNumber: string;

  @ApiProperty()
  bankOffice: string;

  @ApiProperty({ enum: BusinessType })
  businessType: string;

  @ApiProperty()
  companyName: string;

  @ApiProperty()
  companyAddress: string;

  @ApiProperty()
  taxNumber: string;
}

export class ShowResponse {
  @ApiProperty()
  eventId: string;

  @ApiProperty({ type: [ShowingResponse] })
  showings: ShowingResponse[];
}

export class EventBriefResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  eventName: string;

  @ApiProperty()
  eventLogoURL: string;

  @ApiProperty()
  eventBannerURL: string;

  @ApiProperty()
  organizationId: string;

  @ApiProperty({ enum: EventRole })
  role: EventRole;
}

export class EventDetailResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  eventLogoURL: string;

  @ApiProperty()
  eventBannerURL: string;

  @ApiProperty()
  eventName: string;

  @ApiProperty()
  categories: string[];

  @ApiProperty()
  eventDescription: string;

  @ApiProperty()
  orgLogoURL: string;

  @ApiProperty()
  orgName: string;

  @ApiProperty()
  orgDescription: string;

  @ApiProperty()
  venueName: string;

  @ApiProperty()
  cityId: number;

  @ApiProperty()
  districtId: number;

  @ApiProperty()
  wardId: number;

  @ApiProperty()
  street: string;

  @ApiProperty()
  categoriesIds: number[];

  @ApiProperty()
  eventType: string;

  @ApiProperty({ type: SettingResponse })
  setting: SettingResponse;

  @ApiProperty({ type: PaymentInfoResponse })
  paymentInfo: PaymentInfoResponse;

  @ApiProperty({ type: ShowResponse })
  show: ShowResponse;
}

export class EventListAllQuery {
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
    description: 'Event Name',
  })
  keyword: string;

  @ApiProperty({
    required: false,
    example: 'PENDING_APPROVAL',
    description: 'Event status',
  })
  status: string;

  @ApiProperty({
    required: false,
    example: 'name.desc createdAt.asc',
    description: 'name.desc createdAt.asc ',
  })
  sort: string;
}

export class EventListAllResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  addressFull: string;

  @ApiProperty()
  eventBannerURL: string;

  @ApiProperty()
  eventName: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  startTime: Date;

  @ApiProperty()
  endTime: string;

  @ApiProperty()
  status: EventStatus;

  @ApiProperty()
  venueName: string;

  @ApiProperty()
  @IsEnum(EventRole)
  role: string;
}
