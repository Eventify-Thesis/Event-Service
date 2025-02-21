import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  LoggerService,
} from '@nestjs/common';
import { Response } from 'express';
import {
  AppException,
  ErrorResponse,
} from 'src/common/exceptions/app.exception';
import { BaseExceptionFilter } from '@nestjs/core';
import * as _ from 'lodash';

@Catch()
export class AppExceptionFilter extends BaseExceptionFilter {
  private appLogger: LoggerService;
  constructor() {
    super();
    this.appLogger = new Logger();
  }

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>() as any;
    const { error, httpStatus, message, data, statusCode } =
      this._parseError(exception);

    // response error data
    let res = {
      error,
      message,
      statusCode,
    };

    if (data && !_.isEmpty(data)) {
      res = Object.assign(res, {
        data: {
          result: data,
        },
      });
    }

    response.status(httpStatus).json(res);

    // skip log for testing environment
    if (process.env.NODE_ENV !== 'test') {
      this.appLogger.error(message, exception.stack);
    }
  }

  /**
   * parse error
   * @param exception
   */
  private _parseError(exception: unknown): ErrorResponse {
    let error = '';
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '';
    let data = {};
    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;

    // Handle AppException
    if (exception instanceof AppException) {
      error = exception.error;
      httpStatus = exception.httpStatus;
      message = exception.message;
      data = exception.data;
      statusCode = exception.statusCode;
    }

    // Handle HttpException
    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      statusCode = httpStatus;
      const responseData = exception.getResponse();

      if (typeof responseData === 'string') {
        message = responseData;
      } else {
        message = 'internal error';
        if (typeof _.get(responseData, 'message') === 'string') {
          message = _.get(responseData, 'message');
        }
        if (typeof _.get(responseData, 'error') === 'string') {
          error = _.get(responseData, 'error');
        }

        if (responseData.hasOwnProperty('data')) {
          data = responseData;
        }
      }
    }

    // Handle general error
    if (message === '') {
      const error = exception as Error;
      message = error.message;
    }

    return {
      error,
      httpStatus,
      message,
      data,
      statusCode,
    };
  }
}
