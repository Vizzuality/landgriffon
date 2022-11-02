import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';
import {
  Indicator,
  INDICATOR_STATUS,
  INDICATOR_TYPES,
  indicatorResource,
} from 'modules/indicators/indicator.entity';
import { AppInfoDTO } from 'dto/info.dto';
import { IndicatorRepository } from 'modules/indicators/indicator.repository';
import { CreateIndicatorDto } from 'modules/indicators/dto/create.indicator.dto';
import { UpdateIndicatorDto } from 'modules/indicators/dto/update.indicator.dto';
import { H3Data } from 'modules/h3-data/h3-data.entity';
import { getManager, In, SelectQueryBuilder } from 'typeorm';
import { IndicatorNameCodeWithRelatedH3 } from 'modules/indicators/dto/indicator-namecode-with-related-h3.dto';
import { FetchSpecification } from 'nestjs-base-service';

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
      attributes: [
        'id',
        'name',
        'description',
        'unit',
        'status',
        'metadata',
        'nameCode',
      ],
      keyForAttribute: 'camelCase',
    };
  }

  /**
   * Returns all available valid indicators
   */
  async getAllIndicators(): Promise<Indicator[]> {
    // It is assumed that the indicators that are enabled/valid, are the ones that are present on the DB since
    // the initial seeding import. So a simple getAll is sufficient
    return this.findAllUnpaginated();
  }

  async getIndicatorById(id: string): Promise<Indicator> {
    const found: Indicator | undefined = await this.indicatorRepository.findOne(
      id,
      { where: { status: INDICATOR_STATUS.ACTIVE } },
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
    const indicators: Indicator[] = await this.indicatorRepository.findByIds(
      ids,
      { where: { status: INDICATOR_STATUS.ACTIVE } },
    );
    if (!indicators.length) {
      throw new NotFoundException(
        'No Indicator has been found with provided IDs',
      );
    }
    return indicators;
  }

  async findAllUnpaginated(): Promise<Indicator[]> {
    return this.indicatorRepository.find({
      cache: 1000,
      where: { status: INDICATOR_STATUS.ACTIVE },
    });
  }

  async getIndicatorsAndRelatedH3DataIds(): Promise<
    IndicatorNameCodeWithRelatedH3[]
  > {
    const indicators: IndicatorNameCodeWithRelatedH3[] =
      await this.indicatorRepository
        .createQueryBuilder('indicator')
        .select([
          'indicator.id as id',
          'indicator.nameCode as "nameCode"',
          'h3.id as "h3DataId"',
        ])
        .innerJoin(H3Data, 'h3', 'h3.indicatorId = indicator.id')
        .getRawMany();

    if (!indicators.length) {
      throw new NotFoundException(
        `No Indicators with related H3 Data could be found`,
      );
    }
    return indicators;
  }

  async activateIndicators(
    indicatorsFromSheet: CreateIndicatorDto[],
  ): Promise<Indicator[]> {
    const activeIndicatorsNameCodes: string[] = indicatorsFromSheet
      .filter((i: CreateIndicatorDto) => i.status === INDICATOR_STATUS.ACTIVE)
      .map((i: CreateIndicatorDto) => i.nameCode);
    this.logger.log(`Found ${activeIndicatorsNameCodes.length} to activate`);
    const indicatorsToActivate: Indicator[] =
      await this.indicatorRepository.find({
        nameCode: In(activeIndicatorsNameCodes),
      });
    if (!indicatorsToActivate.length) {
      throw new ServiceUnavailableException(
        'No Indicators found matching provided NameCodes. Unable to calculate impact. Aborting Import',
      );
    }
    if (indicatorsToActivate.length !== activeIndicatorsNameCodes.length) {
      this.logger.warn(`Mismatch in indicators meant to be activated: `);
      this.logger.warn(
        `Indicators meant to be activated: ${activeIndicatorsNameCodes.join(
          ', ',
        )}`,
      );
      this.logger.warn(
        `Indicators found in the DB by these namecodes: ${indicatorsToActivate
          .map((i: Indicator) => i.nameCode)
          .join(', ')}`,
      );
      this.logger.warn(`Activating found ones...`);
    }
    const activeIndicators: Indicator[] = indicatorsToActivate.map(
      (i: Indicator) =>
        ({
          ...i,
          status: INDICATOR_STATUS.ACTIVE,
        } as Indicator),
    );
    return this.indicatorRepository.save(activeIndicators);
  }

  async extendFindAllQuery(
    queryBuilder: SelectQueryBuilder<Indicator>,
    fetchSpecificacion: FetchSpecification,
  ): Promise<SelectQueryBuilder<Indicator>> {
    queryBuilder.andWhere(`${this.alias}.status = :status`, {
      status: INDICATOR_STATUS.ACTIVE,
    });
    return queryBuilder;
  }
}
