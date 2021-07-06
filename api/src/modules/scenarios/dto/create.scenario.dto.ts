import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsJSON,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { SCENARIO_STATUS } from 'modules/scenarios/scenario.entity';

export class CreateScenarioDto {
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  @ApiProperty()
  title!: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @IsEnum(Object.values(SCENARIO_STATUS))
  @ApiPropertyOptional()
  status?: string;

  @IsString()
  @IsOptional()
  @IsJSON()
  @ApiPropertyOptional()
  metadata?: string;
}
