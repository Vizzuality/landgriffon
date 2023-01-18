import { AccessControl } from 'modules/authorization/access-control.service';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Scenario } from 'modules/scenarios/scenario.entity';

/**
 * @desciption: Service extending base AccessControl which receives a fresh request object from it each time.
 *              Use this class ta perform user's specific authorisation over scenarios, based on roles/permissions
 */

@Injectable()
export class ScenariosAccessControl extends AccessControl {
  private getScenarioBaseRepository(): Repository<Scenario> {
    return super.getBaseRepositoryFor(Scenario);
  }

  async ownsScenario(scenarioId: string): Promise<boolean> {
    if (super.isUserAdmin()) {
      return true;
    }
    const ownedScenario: Scenario | null =
      await this.getScenarioBaseRepository().findOne({
        where: { id: scenarioId, userId: super.getUserId() },
      });

    return !!ownedScenario;
  }

  async isScenarioPublic(scenarioId: string): Promise<boolean> {
    const publicScenario: Scenario | null =
      await this.getScenarioBaseRepository().findOne({
        where: { id: scenarioId, isPublic: true },
      });

    return !!publicScenario;
  }
}
