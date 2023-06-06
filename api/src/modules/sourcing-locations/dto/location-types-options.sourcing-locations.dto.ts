import { IsBoolean, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { CommonFiltersDto } from 'utils/base.query-builder';

export class GetLocationTypesDto extends CommonFiltersDto {
  @IsUUID('4')
  @ApiPropertyOptional()
  @IsOptional()
  scenarioId?: string;

  @ApiPropertyOptional({
    description:
      'Get all supported location types. Setting this to true overrides all other parameters',
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  supported?: boolean;

  @ApiPropertyOptional({
    description: 'Sorting parameter to order the result. Defaults to ASC ',
    enum: ['ASC', 'DESC'],
  })
  @Type(() => String)
  @IsString()
  @IsOptional()
  @IsIn(['ASC', 'DESC'], {
    message: `sort property must be either 'ASC' (Ascendant) or 'DESC' (Descendent)`,
  })
  sort?: 'ASC' | 'DESC';
}
