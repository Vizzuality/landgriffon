import {
  NestInterceptor,
  ExecutionContext,
  Injectable,
  CallHandler,
} from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

/**
 * @description: Filters all properties decorated by class transformer's @Exclude
 */

@Injectable()
export class SensitiveInfoGuard implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    return next.handle().pipe(map((data: any) => instanceToPlain(data)));
  }
}
