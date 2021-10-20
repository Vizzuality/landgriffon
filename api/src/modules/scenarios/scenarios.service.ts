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
}
