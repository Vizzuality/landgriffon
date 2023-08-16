import { Injectable, NotFoundException } from '@nestjs/common';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';
import { Scenario, scenarioResource } from 'modules/scenarios/scenario.entity';
import { AppInfoDTO } from 'dto/info.dto';
import { ScenarioRepository } from 'modules/scenarios/scenario.repository';
import { CreateScenarioDto } from 'modules/scenarios/dto/create.scenario.dto';
import { UpdateScenarioDto } from 'modules/scenarios/dto/update.scenario.dto';
import { ScenarioInterventionsService } from 'modules/scenario-interventions/scenario-interventions.service';
import { ScenarioIntervention } from 'modules/scenario-interventions/scenario-intervention.entity';
import { SelectQueryBuilder } from 'typeorm';
import { ScenariosAccessControl } from 'modules/authorization/formodule/scenarios.access-control.service';

@Injectable()
export class ScenariosService extends AppBaseService<
  Scenario,
  CreateScenarioDto,
  UpdateScenarioDto,
  AppInfoDTO
> {
  constructor(
    protected readonly scenarioRepository: ScenarioRepository,
    protected readonly scenarioInterventionService: ScenarioInterventionsService,
    protected readonly scenarioAccessControl: ScenariosAccessControl,
  ) {
    super(
      scenarioRepository,
      scenarioResource.name.singular,
      scenarioResource.name.plural,
    );
  }

  get serializerConfig(): JSONAPISerializerConfig<Scenario> {
    return {
      attributes: [
        'title',
        'description',
        'status',
        'metadata',
        'createdAt',
        'updatedAt',
        'isPublic',
        'scenarioInterventions',
        'user',
      ],
      keyForAttribute: 'camelCase',
    };
  }

  async getScenarioById(id: string): Promise<Scenario> {
    const found: Scenario | null = await this.scenarioRepository.findOne({
      where: { id },
    });

    if (!found) {
      throw new NotFoundException(`Scenario with ID "${id}" not found`);
    }

    return found;
  }

  async findInterventionsByScenario(
    id: string,
  ): Promise<ScenarioIntervention[]> {
    const interventions: ScenarioIntervention[] =
      await this.scenarioInterventionService.getScenarioInterventionsByScenarioId(
        id,
      );
    return this.scenarioInterventionService.serialize(interventions);
  }

  async updatePublicScenarioOwnership(
    oldUserId: string,
    newUserId: string,
  ): Promise<void> {
    const publicScenariosOfUser: Scenario[] =
      await this.scenarioRepository.find({
        where: { isPublic: true, userId: oldUserId },
      });
    if (!publicScenariosOfUser.length) return;
    const publicScenariosOfUserIds: string[] = publicScenariosOfUser.map(
      (s: Scenario) => s.id,
    );
    await this.scenarioRepository.update(publicScenariosOfUserIds, {
      userId: newUserId,
      updatedById: newUserId,
    });
  }

  async clearTable(): Promise<void> {
    await this.scenarioRepository.delete({});
  }

  extendFindAllQuery(
    query: SelectQueryBuilder<Scenario>,
    fetchSpecification: Record<string, unknown>,
  ): Promise<SelectQueryBuilder<Scenario>> {
    if (fetchSpecification.hasActiveInterventions) {
      query.andWhere(
        `exists (select from "scenario_intervention" si where si."scenarioId" = "scenario".id and si.status = 'active')`,
      );
    }
    if (fetchSpecification.search) {
      const titlePartialMatch: string = (
        fetchSpecification.search as Record<string, string>
      ).title;
      if (titlePartialMatch) {
        query.andWhere(`"scenario"."title" ILIKE :titlePartialMatch`, {
          titlePartialMatch: `%${titlePartialMatch}%`,
        });
      }
    }
    if (!this.scenarioAccessControl.isUserAdmin()) {
      query.andWhere(`${this.alias}.userId = :userId`, {
        userId: this.scenarioAccessControl.getUserId(),
      });
      query.orWhere(`${this.alias}.isPublic = :isPublic`, {
        isPublic: true,
      });
    }
    return Promise.resolve(query);
  }
}
