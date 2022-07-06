import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AvailableResolutions } from 'modules/h3-data/dto/get-material-h3-by-resolution.dto';

export class GetContextualLayerH3Dto {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(6)
  @IsEnum(AvailableResolutions, { message: 'Available resolutions: 1 to 6' })
  resolution!: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  year?: number;
}
