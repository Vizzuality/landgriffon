import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for querying a resolution given a H3 ID
 */

export enum AvailableResolutions {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5,
  SIX = 6,
}
/**
 * @debt: Add some bypass to exception filter to return validation errors on a more readable way
 */
export class GetMaterialH3ByResolutionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  materialId!: string;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @IsEnum(AvailableResolutions, { message: 'Available resolutions: 1 to 6' })
  resolution!: number;
}
