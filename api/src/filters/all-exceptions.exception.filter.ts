import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import * as config from 'config';

import * as JSONAPISerializer from 'jsonapi-serializer';
import { JSONAPIError, JSONAPIErrorOptions } from 'jsonapi-serializer';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';

/**
 * Catch-all exception filter. Output error data to logs, and send it as
 * response payload, serialized according to JSON:API spec.
 *
 * @debt The error handling logic for general cases should be moved to a utility
 * module, with option to extend it for specific per-service scenarios.
 */
@Catch(Error)
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    const ctx: HttpArgumentsHost = host.switchToHttp();
    const response: any = ctx.getResponse();
    const request: any = ctx.getRequest();

    const status: number =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    /**
     * Core error data.
     */
    const errorData: JSONAPIErrorOptions = {
      status: status.toString(10),
      title: exception.message,
      meta: {
        timestamp: new Date().toISOString(),
        path: request.url,
        type: Object.getPrototypeOf(exception)?.name,
      },
    };

    if (['development', 'test'].includes(config.util.getEnv('NODE_ENV'))) {
      errorData.meta.rawError = exception;
      errorData.meta.stack = exception.stack;
    }

    if (status >= 500) {
      Logger.error(errorData);
    } else {
      Logger.warn(errorData);
    }

    /**
     * When *not* running in a development environment, we strip off raw error
     * details and stack trace.
     *
     * @todo We should remove raw error details from the HTTP response payload
     * even in development environments at some point, but for the time being
     * these should help frontend devs and other API users report bugs or other
     * issues without having to look at logs.
     */
    const errorDataForResponse: JSONAPIError = new JSONAPISerializer.Error(
      errorData,
    );

    response.status(status).json(errorDataForResponse);
  }
}
