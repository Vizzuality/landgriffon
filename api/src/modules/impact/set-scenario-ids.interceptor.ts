import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

export class SetScenarioIdsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request: any = context.switchToHttp().getRequest();

    // For dtos of impact and actual-vs-scenario
    if (request.query.scenarioId) {
      request.query.scenarioIds = [request.query.scenarioId];
    }

    // For dto of scenario vs scenario
    if (request.query.scenarioOneId && request.query.scenarioTwoId) {
      request.query.scenarioIds = [
        request.query.scenarioOneId,
        request.query.scenarioTwoId,
      ];
    }

    return next.handle();
  }
}
