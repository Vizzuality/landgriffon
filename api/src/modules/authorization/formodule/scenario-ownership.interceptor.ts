import {
  applyDecorators,
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NestInterceptor,
  SetMetadata,
  UseInterceptors,
} from '@nestjs/common';
import { ScenariosAccessControl } from 'modules/authorization/formodule/scenarios.access-control.service';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';

interface ScenarioCheckWhiteListOptions {
  bypassIfScenarioIsPublic: boolean;
}

const SCENARIO_CHECK_METADATA_KEY: string = 'scenarioChecks';

@Injectable()
export class ScenarioOwnershipInterceptor implements NestInterceptor {
  constructor(
    private readonly scenarioAcl: ScenariosAccessControl,
    private readonly reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request: Request = context.switchToHttp().getRequest();
    const scenarioId: string = request.params.id;
    const additionalChecks: ScenarioCheckWhiteListOptions =
      this.reflector.getAllAndOverride<ScenarioCheckWhiteListOptions>(
        SCENARIO_CHECK_METADATA_KEY,
        [context.getHandler(), context.getClass()],
      );
    if (this.scenarioAcl.isUserAdmin()) {
      return next.handle();
    }
    let isPublic: boolean = false;
    const isOwned: boolean = await this.scenarioAcl.ownsScenario(scenarioId);
    if (additionalChecks?.bypassIfScenarioIsPublic) {
      isPublic = await this.scenarioAcl.isScenarioPublic(scenarioId);
    }

    if (!isPublic && !isOwned) {
      throw new ForbiddenException();
    }
    return next.handle();
  }
}

export function UserOwnsScenario(options?: ScenarioCheckWhiteListOptions): any {
  return applyDecorators(
    SetMetadata(SCENARIO_CHECK_METADATA_KEY, options),
    UseInterceptors(ScenarioOwnershipInterceptor),
  );
}
