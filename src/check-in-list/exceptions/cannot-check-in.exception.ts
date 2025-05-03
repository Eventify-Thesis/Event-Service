import { BadRequestException } from '@nestjs/common';

export class CannotCheckInException extends BadRequestException {
  constructor(message: string) {
    super(message);
  }
}
