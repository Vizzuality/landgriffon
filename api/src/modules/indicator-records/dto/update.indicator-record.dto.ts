import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateIndicatorCoefficientDto } from 'modules/indicator-coefficients/dto/create.indicator-coefficient.dto';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { INDICATOR_RECORD_STATUS } from 'modules/indicator-records/indicator-record.entity';

export class UpdateIndicatorRecordDto extends PartialType(
  CreateIndicatorCoefficientDto,
) {
  @IsInt()
  @IsOptional()
  @ApiPropertyOptional()
  value?: number;

  @IsString()
  @IsOptional()
  @IsEnum(INDICATOR_RECORD_STATUS)
  @ApiPropertyOptional()
  status?: string;
}
