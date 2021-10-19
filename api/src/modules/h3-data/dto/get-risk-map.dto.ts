import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { GetMaterialH3ByResolutionDto } from 'modules/h3-data/dto/get-material-h3-by-resolution.dto';
/**
 * @note: DTO for querying a Risk Map given Material and Indicator IDs, for a year
 * Currently we are just working with one year, whose values are implicitly present
 * in the H3 data.
 *
 * In a future, we'll need to select a risk-map by year
 */

export class GetRiskMapH3Dto extends GetMaterialH3ByResolutionDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  indicatorId!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  year!: number;
}
