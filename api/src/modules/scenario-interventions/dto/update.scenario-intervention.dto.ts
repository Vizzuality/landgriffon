import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateScenarioInterventionDto } from 'modules/scenario-interventions/dto/create.scenario-intervention.dto';
import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { SCENARIO_INTERVENTION_STATUS } from '../scenario-intervention.entity';

export class UpdateScenarioInterventionDto extends PartialType(
  CreateScenarioInterventionDto,
) {
  @IsNotEmpty()
  @IsUUID()
  updatedById: string;

  @IsOptional()
  @IsEnum(Object.values(SCENARIO_INTERVENTION_STATUS))
  @ApiPropertyOptional({
    description: 'Status of the intervention',
    enum: Object.values(SCENARIO_INTERVENTION_STATUS),
    example: SCENARIO_INTERVENTION_STATUS.INACTIVE,
  })
  status?: string;
}
