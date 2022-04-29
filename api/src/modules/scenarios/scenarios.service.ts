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

@Injectable()
export class ScenariosService extends AppBaseService<
  Scenario,
  CreateScenarioDto,
  UpdateScenarioDto,
  AppInfoDTO
> {
  constructor(
    @InjectRepository(ScenarioRepository)
    protected readonly repository: ScenarioRepository,
    protected readonly scenarioInterventionService: ScenarioInterventionsService,
  ) {
    super(
      repository,
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

  async getScenarioById(id: number): Promise<Scenario> {
    const found: Scenario | undefined = await this.repository.findOne(id);

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
}
