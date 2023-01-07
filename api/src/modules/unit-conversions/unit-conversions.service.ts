import { Injectable, NotFoundException } from '@nestjs/common';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';
import {
  UnitConversion,
  unitConversionResource,
} from 'modules/unit-conversions/unit-conversion.entity';
import { AppInfoDTO } from 'dto/info.dto';
import { UnitConversionRepository } from 'modules/unit-conversions/unit-conversion.repository';
import { CreateUnitConversionDto } from 'modules/unit-conversions/dto/create.unit-conversion.dto';
import { UpdateUnitConversionDto } from 'modules/unit-conversions/dto/update.unit-conversion.dto';

@Injectable()
export class UnitConversionsService extends AppBaseService<
  UnitConversion,
  CreateUnitConversionDto,
  UpdateUnitConversionDto,
  AppInfoDTO
> {
  constructor(
    protected readonly unitConversionRepository: UnitConversionRepository,
  ) {
    super(
      unitConversionRepository,
      unitConversionResource.name.singular,
      unitConversionResource.name.plural,
    );
  }

  get serializerConfig(): JSONAPISerializerConfig<UnitConversion> {
    return {
      attributes: ['unit1', 'unit2', 'factor'],
      keyForAttribute: 'camelCase',
    };
  }

  async getUnitConversionByUnitId(unitId: string): Promise<UnitConversion> {
    const unitConversion: UnitConversion | null =
      await this.unitConversionRepository.findOne({
        where: { id: unitId },
      });
    if (!unitConversion) {
      throw new NotFoundException(
        `Conversion unit with Unit ID "${unitId}" not found`,
      );
    }
    return unitConversion;
  }
}
