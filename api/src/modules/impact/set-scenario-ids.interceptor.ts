import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

export class SetScenarioIdsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request: any = context.switchToHttp().getRequest();

    if (request.scenarioId) {
      request.scenarioIds = [request.scenarioId];
    }

    if (request.scenarioOneId && request.scenarioTwoId) {
      request.scenarioIds = [request.scenarioOneId, request.scenarioTwoId];
    }

    return next.handle();
  }
}
