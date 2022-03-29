import { PartialType } from '@nestjs/swagger';
import { CreateScenarioInterventionDto } from 'modules/scenario-interventions/dto/create.scenario-intervention.dto';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateScenarioInterventionDto extends PartialType(
  CreateScenarioInterventionDto,
) {
  @IsNotEmpty()
  @IsUUID()
  updatedById: string;
}
