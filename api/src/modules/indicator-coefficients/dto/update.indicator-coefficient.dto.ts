import { PartialType } from '@nestjs/swagger';
import { CreateIndicatorCoefficientDto } from 'modules/indicator-coefficients/dto/create.indicator-coefficient.dto';

export class UpdateIndicatorCoefficientDto extends PartialType(
  CreateIndicatorCoefficientDto,
) {}
