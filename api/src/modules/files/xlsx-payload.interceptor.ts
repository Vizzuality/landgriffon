// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';

/**
 * @debt: Add proper type casting to request object
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
