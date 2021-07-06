import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateScenarioDto } from 'modules/scenarios/dto/create.scenario.dto';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateScenarioDto extends PartialType(CreateScenarioDto) {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(40)
  @ApiProperty()
  title?: string;
}
