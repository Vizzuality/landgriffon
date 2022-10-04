import { PartialType } from '@nestjs/swagger';
import { CreateUnitConversionDto } from 'modules/unit-conversions/dto/create.unit-conversion.dto';

export class UpdateUnitConversionDto extends PartialType(
  CreateUnitConversionDto,
) {}
