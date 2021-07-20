import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class XlsxPayloadInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): any {
    const request: Request = context.switchToHttp().getRequest<Request>();
    if (!request?.file) {
      throw new BadRequestException(`A .XLSX file must be provided as payload`);
    }

    return next.handle();
  }
}
