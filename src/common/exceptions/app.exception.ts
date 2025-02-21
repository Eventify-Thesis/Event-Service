import { HttpStatus } from '@nestjs/common';

export interface ErrorResponse {
  message: string;
  error?: string;
  httpStatus?: number;
  statusCode?: number;
  data?: any;
}

const ErrorResponseDefaultValues: Pick<
  ErrorResponse,
  'httpStatus' | 'statusCode' | 'data' | 'error'
> = {
  error: 'INTERNAL_SERVER_ERROR',
  httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
  statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  data: {},
};

export class AppException extends Error {
  public error;
  public httpStatus;
  public data;
  public statusCode;

  constructor(params: ErrorResponse) {
    const initData: ErrorResponse = {
      ...ErrorResponseDefaultValues,
      ...params,
    };
    super(initData.message);
    this.error = initData.error;
    this.httpStatus = initData.httpStatus;
    this.data = initData.data;
    this.statusCode = initData.httpStatus
      ? initData.httpStatus
      : initData.statusCode;
  }
}
