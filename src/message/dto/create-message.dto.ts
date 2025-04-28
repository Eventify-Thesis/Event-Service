import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export enum MessageType {
  ATTENDEE = 'ATTENDEE',
  ORDER = 'ORDER',
  TICKET = 'TICKET',
  EVENT = 'EVENT'
}

export class CreateMessageDto {
  @IsString()
  subject: string;

  @IsString()
  message: string;

  @IsEnum(MessageType)
  messageType: MessageType;

  @IsString()
  @IsOptional()
  eventId: string;

  @IsString()
  @IsOptional()
  sentByUserId: string;

  @IsOptional()
  @IsArray()
  attendeeIds?: string[];

  @IsOptional()
  @IsArray()
  ticketTypeIds?: string[];

  @IsOptional()
  @IsNumber()
  orderId?: number;

  @IsOptional()
  @IsBoolean()
  isTest?: boolean;

  @IsArray()
  @IsOptional()
  recipientEmails: string[];

  @IsOptional()
  @IsBoolean()
  sendCopyToCurrentUser?: boolean;
}