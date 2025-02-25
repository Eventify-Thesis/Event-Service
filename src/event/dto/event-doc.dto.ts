import { ApiProperty } from '@nestjs/swagger';
import { BusinessType } from '../event.constant';

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