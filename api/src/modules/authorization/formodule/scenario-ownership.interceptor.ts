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
  bypassIfScenarioIsPublic?: boolean;

  isComparisonMode?: boolean;
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
    if (this.scenarioAcl.isUserAdmin()) {
      return next.handle();
    }
    const request: Request = context.switchToHttp().getRequest();
    const additionalChecks: ScenarioCheckWhiteListOptions =
      this.reflector.getAllAndOverride<ScenarioCheckWhiteListOptions>(
        SCENARIO_CHECK_METADATA_KEY,
        [context.getHandler(), context.getClass()],
      );
    if (additionalChecks?.isComparisonMode) {
      const isComparisonAuthorized: boolean =
        await this.isComparisonRequestAuthorized(request, additionalChecks);
      if (!isComparisonAuthorized) {
        throw new ForbiddenException();
      }
      return next.handle();
    }

    const scenarioId: string = request.params.id;
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

  /**
   * @description: Checks if the user is authorized to compare the scenarios
   *               the user must either own the scenarios or the scenarios must be public
   */

  private async isComparisonRequestAuthorized(
    request: Request,
    additionalChecks: ScenarioCheckWhiteListOptions,
  ): Promise<boolean> {
    const baseScenarioId: string = request.query.baseScenarioId as string;
    const comparedScenarioId: string = request.query
      .comparedScenarioId as string;

    const baseIsOwned: boolean = baseScenarioId
      ? await this.scenarioAcl.ownsScenario(baseScenarioId)
      : true;
    const comparedIsOwned: boolean = comparedScenarioId
      ? await this.scenarioAcl.ownsScenario(comparedScenarioId)
      : true;

    let baseIsPublic: boolean = false;
    let comparedIsPublic: boolean = false;
    if (additionalChecks?.bypassIfScenarioIsPublic) {
      if (baseScenarioId) {
        baseIsPublic = await this.scenarioAcl.isScenarioPublic(baseScenarioId);
      }
      if (comparedScenarioId) {
        comparedIsPublic = await this.scenarioAcl.isScenarioPublic(
          comparedScenarioId,
        );
      }
    }

    const authorizedBaseScenario: boolean = baseScenarioId
      ? baseIsPublic || baseIsOwned
      : true;
    const authorizedComparedScenario: boolean =
      comparedIsPublic || comparedIsOwned;

    return authorizedBaseScenario && authorizedComparedScenario;
  }
}

export function CheckUserOwnsScenario(
  options?: ScenarioCheckWhiteListOptions,
): any {
  return applyDecorators(
    SetMetadata(SCENARIO_CHECK_METADATA_KEY, options),
    UseInterceptors(ScenarioOwnershipInterceptor),
  );
}
