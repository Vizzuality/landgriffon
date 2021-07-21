import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateIndicatorCoefficientDto } from 'modules/indicator-coefficients/dto/create.indicator-coefficient.dto';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { TASK_STATUS } from 'modules/indicator-records/indicator-record.entity';

export class UpdateIndicatorRecordDto extends PartialType(
  CreateIndicatorCoefficientDto,
) {
  @IsInt()
  @ApiProperty()
  value!: number;

  @IsString()
  @IsOptional()
  @IsEnum(Object.values(TASK_STATUS))
  @ApiPropertyOptional()
  status?: string;
}
