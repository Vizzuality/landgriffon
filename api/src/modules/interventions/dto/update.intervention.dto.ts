import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateInterventionDto } from 'modules/interventions/dto/create.intervention.dto';
import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { INTERVENTION_STATUS } from 'modules/interventions/intervention.entity';

export class UpdateInterventionDto extends PartialType(CreateInterventionDto) {
  @IsNotEmpty()
  @IsUUID()
  updatedById: string;

  @IsOptional()
  @IsEnum(INTERVENTION_STATUS)
  @ApiPropertyOptional({
    description: 'Status of the intervention',
    enum: Object.values(INTERVENTION_STATUS),
    example: INTERVENTION_STATUS.INACTIVE,
  })
  status?: string;
}
