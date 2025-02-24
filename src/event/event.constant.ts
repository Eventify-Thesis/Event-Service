import { HttpStatus } from '@nestjs/common';

export enum EventType {
  'ONLINE' = 'Online',
  'OFFLINE' = 'Offline',
}

export enum EventStatus {
  DRAFT = 'Draft',
  PUBLISHED = 'Published',
  INCOMING = 'Incoming',
  WATING_FOR_APPROVAL = 'Waiting for approval',
}

export enum BusinessType {
  ORGANIZER = 'organizer',
  INDIVIDUAL = 'individual',
}

export const MESSAGE = {
  EVENT_NOT_FOUND: {
    error: 'EVENT_NOT_FOUND',
    message: 'Event not found',
    httpStatus: HttpStatus.NOT_FOUND,
  },
};
