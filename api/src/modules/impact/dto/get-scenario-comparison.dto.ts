import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';
import { GetImpactTableDto } from 'modules/impact/dto/get-impact-table.dto';

export class GetScenarioComparisonDto extends GetImpactTableDto {
  @ApiProperty({
    name: 'scenarioIds[]',
    description: 'Array containg 2 Scenario Ids to compare',
  })
  @IsNotEmpty()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsUUID(4, { each: true })
  @Type(() => String)
  scenarioIds: string[];
}
