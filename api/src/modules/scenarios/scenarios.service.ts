import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
        'scenarioInterventions',
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

  async clearTable(): Promise<void> {
    await this.scenarioRepository.delete({});
  }

  extendFindAllQuery(
    query: SelectQueryBuilder<Scenario>,
    fetchSpecification: Record<string, unknown>,
    info: AppInfoDTO,
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
    return Promise.resolve(query);
  }
}
