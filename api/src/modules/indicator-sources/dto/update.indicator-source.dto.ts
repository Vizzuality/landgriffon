import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateIndicatorSourceDto } from 'modules/indicator-sources/dto/create.indicator-source.dto';
import {
  IsJSON,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateIndicatorSourceDto extends PartialType(
  CreateIndicatorSourceDto,
) {
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  @ApiPropertyOptional()
  @IsOptional()
  title?: string;

  @IsString()
  @ApiPropertyOptional()
  @IsOptional()
  layerId?: string;
}
