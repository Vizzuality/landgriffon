import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
/**
 * @note: DTO for querying a Risk Map given Material and Indicator IDs, for a year
 * Currently we are just working with one year, whose values are implicitly present
 * in the H3 data.
 *
 * In a future, we'll need to select a risk-map by year
 */

export class GetRiskMapDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  indicatorId!: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  materialId!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  year!: number;
}
