/**
 * DTO for querying a resolution given a H3 ID
 */
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

/**
 * Default (and max) resolution to retrieve h3 indexes if none is given
 */
export const DEFAULT_RESOLUTION = 6;

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
export class H3ByResolutionDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsEnum(AvailableResolutions, { message: 'Available resolutions: 1 to 6' })
  resolution?: number;
}
