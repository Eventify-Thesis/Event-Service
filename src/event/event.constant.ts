import { HttpStatus } from '@nestjs/common';

export enum EventType {
  'ONLINE' = 'ONLINE',
  'OFFLINE' = 'OFFLINE',
}

export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  INCOMING = 'INCOMING',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
}

export enum BusinessType {
  ORGANIZER = 'ORGANIZER',
  INDIVIDUAL = 'INDIVIDUAL',
}

export const MESSAGE = {
  EVENT_NOT_FOUND: {
    error: 'EVENT_NOT_FOUND',
    message: 'Event not found',
    httpStatus: HttpStatus.NOT_FOUND,
  },
  SETTING_NOT_FOUND: {
    error: 'SETTING_NOT_FOUND',
    message: 'Setting not found',
    httpStatus: HttpStatus.NOT_FOUND,
  },
  PAYMENT_INFO_NOT_FOUND: {
    error: 'PAYMENT_INFO_NOT_FOUND',
    message: 'Payment info not found',
    httpStatus: HttpStatus.NOT_FOUND,
  },
  SHOW_NOT_FOUND: {
    error: 'SHOW_NOT_FOUND',
    message: 'Show not found',
    httpStatus: HttpStatus.NOT_FOUND,
  }
};
