import { HttpStatus } from '@nestjs/common';

export const MESSAGE = {
  INTEREST_ALREADY_EXISTS: {
    error: 'INTEREST_ALREADY_EXISTS',
    message: 'User already bookmarked this event',
    httpStatus: HttpStatus.CONFLICT,
  },
  INTEREST_NOT_FOUND: {
    error: 'INTEREST_NOT_FOUND',
    message: 'User does not bookmark this event',
    httpStatus: HttpStatus.NOT_FOUND,
  },
  USER_NOT_FOUND: {
    error: 'USER_NOT_FOUND',
    message: 'User not found',
    httpStatus: HttpStatus.NOT_FOUND,
  },
  USER_ID_REQUIRED: {
    error: 'USER_ID_REQUIRED',
    message: 'User ID is required',
    httpStatus: HttpStatus.BAD_REQUEST,
  },
  EVENT_ID_REQUIRED: {
    error: 'EVENT_ID_REQUIRED',
    message: 'Event ID is required',
    httpStatus: HttpStatus.BAD_REQUEST,
  },
  CANNOT_DELETE_INTEREST: {
    error: 'CANNOT_DELETE_INTEREST',
    message: 'You cannot delete this member',
    httpStatus: HttpStatus.FORBIDDEN,
  },
};
