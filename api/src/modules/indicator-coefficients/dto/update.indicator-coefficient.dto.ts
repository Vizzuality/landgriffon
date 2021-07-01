import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateIndicatorCoefficientDto } from 'modules/indicator-coefficients/dto/create.indicator-coefficient.dto';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateIndicatorCoefficientDto extends PartialType(
  CreateIndicatorCoefficientDto,
) {}
