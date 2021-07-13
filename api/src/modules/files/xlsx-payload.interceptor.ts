// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

/**
 * @debt: Add proper type casting to request object
 *
 * This interceptor could handle file / file extension validation
 * but it will require to clean-up storage folder since file will be written
 * prior this interceptor is called
 *
 */

Injectable();
export class XlsxPayloadInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): any {
    const request = context.switchToHttp().getRequest<Request>();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!request?.file) {
      throw new BadRequestException(`A .XLSX file must be provided as payload`);
    }

    return next.handle();
  }
}
