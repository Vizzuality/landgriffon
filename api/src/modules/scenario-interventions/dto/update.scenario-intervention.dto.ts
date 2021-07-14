import { PartialType } from '@nestjs/swagger';
import { CreateScenarioInterventionDto } from 'modules/scenario-interventions/dto/create.scenario-intervention.dto';

export class UpdateScenarioInterventionDto extends PartialType(
  CreateScenarioInterventionDto,
) {}
