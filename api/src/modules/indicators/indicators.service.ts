import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';
import {
  Indicator,
  INDICATOR_TYPES,
  indicatorResource,
} from 'modules/indicators/indicator.entity';
import { AppInfoDTO } from 'dto/info.dto';
import { IndicatorRepository } from 'modules/indicators/indicator.repository';
import { CreateIndicatorDto } from 'modules/indicators/dto/create.indicator.dto';
import { UpdateIndicatorDto } from 'modules/indicators/dto/update.indicator.dto';
import { H3Data } from 'modules/h3-data/h3-data.entity';
import { getManager } from 'typeorm';

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
    const found: Indicator | undefined = await this.indicatorRepository.findOne(
      id,
    );

    if (!found) {
      throw new NotFoundException(`Indicator with ID "${id}" not found`);
    }

    return found;
  }

  async getDeforestationH3Data(): Promise<H3Data> {
    /**
     * @note: For at least 2 types of risk maps, retrieving a fixed Indicator's data
     * is required to perform the query, and no data to retrieve this Indicator is provided
     * in the client's request
     */

    const deforestationIndicator: Indicator | undefined =
      await this.indicatorRepository.findOne({
        nameCode: INDICATOR_TYPES.DEFORESTATION,
      });
    if (!deforestationIndicator)
      throw new NotFoundException(
        'No Deforestation Indicator data found in database',
      );
    const deforestationH3Data: any = await getManager()
      .createQueryBuilder()
      .select()
      .from('h3_data', 'h3_data')
      .where('"indicatorId" = :indicatorId', {
        indicatorId: deforestationIndicator.id,
      })
      .getRawOne();
    if (!deforestationH3Data)
      throw new NotFoundException(
        'No Deforestation Indicator H3 data found in database, required to retrieve Biodiversity Loss and Carbon Risk-Maps',
      );
    return deforestationH3Data;
  }

  async getIndicatorsById(ids: string[]): Promise<Indicator[]> {
    return this.indicatorRepository.findByIds(ids);
  }

  async findAllUnpaginated(): Promise<Indicator[]> {
    return this.indicatorRepository.find();
  }
}
