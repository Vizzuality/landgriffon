import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';
import {
  Indicator,
  indicatorResource,
} from 'modules/indicators/indicator.entity';
import { AppInfoDTO } from 'dto/info.dto';
import { IndicatorRepository } from 'modules/indicators/indicator.repository';
import { CreateIndicatorDto } from 'modules/indicators/dto/create.indicator.dto';
import { UpdateIndicatorDto } from 'modules/indicators/dto/update.indicator.dto';

@Injectable()
export class IndicatorsService extends AppBaseService<
  Indicator,
  CreateIndicatorDto,
  UpdateIndicatorDto,
  AppInfoDTO
> {
  constructor(
    @InjectRepository(IndicatorRepository)
    protected readonly indicatorRepository: IndicatorRepository,
  ) {
    super(
      indicatorRepository,
      indicatorResource.name.singular,
      indicatorResource.name.plural,
    );
  }

  get serializerConfig(): JSONAPISerializerConfig<Indicator> {
    return {
      attributes: ['id', 'name', 'description', 'unit', 'status', 'metadata'],
      keyForAttribute: 'camelCase',
    };
  }

  async getIndicatorById(id: string): Promise<Indicator> {
    const found = await this.indicatorRepository.findOne(id);

    if (!found) {
      throw new NotFoundException(`Indicator with ID "${id}" not found`);
    }

    return found;
  }
}
