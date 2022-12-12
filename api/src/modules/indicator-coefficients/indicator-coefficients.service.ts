import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';
import {
  IndicatorCoefficient,
  indicatorCoefficientResource,
} from 'modules/indicator-coefficients/indicator-coefficient.entity';
import { AppInfoDTO } from 'dto/info.dto';
import { IndicatorCoefficientRepository } from 'modules/indicator-coefficients/indicator-coefficient.repository';
import { CreateIndicatorCoefficientDto } from 'modules/indicator-coefficients/dto/create.indicator-coefficient.dto';
import { UpdateIndicatorCoefficientDto } from 'modules/indicator-coefficients/dto/update.indicator-coefficient.dto';

@Injectable()
export class IndicatorCoefficientsService extends AppBaseService<
  IndicatorCoefficient,
  CreateIndicatorCoefficientDto,
  UpdateIndicatorCoefficientDto,
  AppInfoDTO
> {
  constructor(
    @InjectRepository(IndicatorCoefficientRepository)
    protected readonly indicatorCoefficientRepository: IndicatorCoefficientRepository,
  ) {
    super(
      indicatorCoefficientRepository,
      indicatorCoefficientResource.name.singular,
      indicatorCoefficientResource.name.plural,
    );
  }

  get serializerConfig(): JSONAPISerializerConfig<IndicatorCoefficient> {
    return {
      attributes: ['value', 'year', 'createdAt', 'updatedAt'],
      keyForAttribute: 'camelCase',
    };
  }

  async getIndicatorCoefficientById(id: string): Promise<IndicatorCoefficient> {
    const found: IndicatorCoefficient | null =
      await this.indicatorCoefficientRepository.findOneBy({ id });
    if (!found) {
      throw new NotFoundException(
        `Indicator Coefficient with ID "${id}" not found`,
      );
    }

    return found;
  }
}
