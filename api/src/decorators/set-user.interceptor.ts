import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

export class SetUserInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request: any = context.switchToHttp().getRequest();
    if (!request.user) return next.handle();

    switch (request.method) {
      case 'PUT':
      case 'PATCH':
        request.body.updatedById = request.user.id;
        break;
      case 'POST':
        request.body.userId = request.user.id;
        break;
    }

    return next.handle();
  }
}
