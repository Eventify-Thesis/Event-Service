import { HttpStatus } from '@nestjs/common';

export enum EventType {
  'ONLINE' = 'ONLINE',
  'OFFLINE' = 'OFFLINE',
}

export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  UPCOMING = 'UPCOMING',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  CANCELLED = 'CANCELLED',
}

export enum BusinessType {
  COMPANY = 'COMPANY',
  PERSONAL = 'PERSONAL',
}

export enum AgeRestriction {
  ALL_AGES = 'ALL_AGES',
  OVER_18 = 'OVER_18',
  OVER_21 = 'OVER_21',
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
  },
  INVALID_STATUS: {
    error: 'INVALID_STATUS',
    message: 'Invalid status',
    httpStatus: HttpStatus.BAD_REQUEST,
  },
  EVENT_ALREADY_CENSORED: {
    error: 'EVENT_ALREADY_CENSORED',
    message: 'Event already censored',
    httpStatus: HttpStatus.BAD_REQUEST,
  },
};
