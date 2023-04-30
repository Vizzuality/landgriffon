import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateScenarioDto } from 'modules/scenarios/dto/create.scenario.dto';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateScenarioDto extends PartialType(CreateScenarioDto) {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(40)
  @ApiProperty()
  title?: string;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional()
  isPublic: boolean;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsNotEmpty()
  @IsUUID()
  updatedById: string;
}
