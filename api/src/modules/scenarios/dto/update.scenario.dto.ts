import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateScenarioDto } from 'modules/scenarios/dto/create.scenario.dto';
import {
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

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsNotEmpty()
  @IsUUID()
  updatedById: string;
}
