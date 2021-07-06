import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';
import {
  IndicatorSource,
  indicatorSourceResource,
} from 'modules/indicator-sources/indicator-source.entity';
import { AppInfoDTO } from 'dto/info.dto';
import { IndicatorSourceRepository } from 'modules/indicator-sources/indicator-source.repository';
import { CreateIndicatorSourceDto } from 'modules/indicator-sources/dto/create.indicator-source.dto';
import { UpdateIndicatorSourceDto } from 'modules/indicator-sources/dto/update.indicator-source.dto';

@Injectable()
export class IndicatorSourcesService extends AppBaseService<
  IndicatorSource,
  CreateIndicatorSourceDto,
  UpdateIndicatorSourceDto,
  AppInfoDTO
> {
  constructor(
    @InjectRepository(IndicatorSourceRepository)
    protected readonly indicatorSourceRepository: IndicatorSourceRepository,
  ) {
    super(
      indicatorSourceRepository,
      indicatorSourceResource.name.singular,
      indicatorSourceResource.name.plural,
    );
  }

  get serializerConfig(): JSONAPISerializerConfig<IndicatorSource> {
    return {
      attributes: ['title', 'description', 'metadata'],
      keyForAttribute: 'camelCase',
    };
  }

  async getIndicatorSourceById(id: number): Promise<IndicatorSource> {
    const found = await this.indicatorSourceRepository.findOne(id);

    if (!found) {
      throw new NotFoundException(`indicator source with ID "${id}" not found`);
    }

    return found;
  }
}
