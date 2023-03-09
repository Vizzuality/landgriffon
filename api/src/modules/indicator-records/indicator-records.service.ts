import { Injectable, NotFoundException } from '@nestjs/common';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';
import {
  IndicatorRecord,
  indicatorRecordResource,
} from 'modules/indicator-records/indicator-record.entity';
import { CreateIndicatorRecordDto } from 'modules/indicator-records/dto/create.indicator-record.dto';
import { UpdateIndicatorRecordDto } from 'modules/indicator-records/dto/update.indicator-record.dto';
import { AppInfoDTO } from 'dto/info.dto';
import { IndicatorRecordRepository } from 'modules/indicator-records/indicator-record.repository';
import { IndicatorsService } from 'modules/indicators/indicators.service';
import { Indicator } from 'modules/indicators/indicator.entity';
import { H3DataService } from 'modules/h3-data/h3-data.service';
import { MaterialsToH3sService } from 'modules/materials/materials-to-h3s.service';
import { H3DataYearsService } from 'modules/h3-data/services/h3-data-years.service';
import { IndicatorNameCodeWithRelatedH3 } from 'modules/indicators/dto/indicator-namecode-with-related-h3.dto';
import { CachedDataService } from 'modules/cached-data/cached-data.service';
import { ImpactCalculator } from 'modules/indicator-records/services/impact-calculator.service';
import { IMPACT_VIEW_NAME } from 'modules/impact/views/impact.materialized-view.entity';
import { DataSource } from 'typeorm';

export interface CachedRawValue {
  rawValue: number;
}

@Injectable()
export class IndicatorRecordsService extends AppBaseService<
  IndicatorRecord,
  CreateIndicatorRecordDto,
  UpdateIndicatorRecordDto,
  AppInfoDTO
> {
  constructor(
    private readonly indicatorRecordRepository: IndicatorRecordRepository,
    private readonly indicatorService: IndicatorsService,
    private readonly impactCalculator: ImpactCalculator,
    private readonly h3DataService: H3DataService,
    private readonly materialsToH3sService: MaterialsToH3sService,
    private readonly h3DataYearsService: H3DataYearsService,
    private readonly cachedDataService: CachedDataService,
    private readonly dataSource: DataSource,
  ) {
    super(
      indicatorRecordRepository,
      indicatorRecordResource.name.singular,
      indicatorRecordResource.name.plural,
    );
  }

  get serializerConfig(): JSONAPISerializerConfig<IndicatorRecord> {
    return {
      attributes: [
        'value',
        'status',
        'statusMsg',
        'createdAt',
        'updatedAt',
        'indicatorId',
        'indicatorCoefficientId',
        'sourcingRecordId',
      ],
      keyForAttribute: 'camelCase',
    };
  }

  async getIndicatorRecordById(id: string): Promise<IndicatorRecord> {
    const found: IndicatorRecord | null =
      await this.indicatorRecordRepository.findOneBy({ id });
    if (!found) {
      throw new NotFoundException(`Indicator Record with ID "${id}" not found`);
    }

    return found;
  }

  async clearTable(): Promise<void> {
    await this.indicatorRecordRepository.delete({});
  }

  /**
   * @description Creates Indicator Records from all existing Sourcing Records in the DB
   */
  // TODO still not adapted to modular indicators, because the performance gets hit drastically on the source import. Pending to be worked on

  /**
   * @description Creates Indicator-Records for a single Sourcing-Record, by first retrieving Raw Indicator data from the DB, then applying
   * the methodology and persist new Indicator Records
   */

  /**
   * Creates an IndicatorRecord object instance from the given input (type, calculated values, and h3data)
   * @param indicator
   * @param calculatedValues
   * @private
   */

  /**
   * Consumes Indicator Raw Data from the DB to calculate final values for Indicator Records
   * @param sourcingRecordId
   * @param tonnage
   * @param materialH3DataId
   * @param indicatorComputedRawData
   * @private
   */

  // TODO: Check what is actually needed from this indicator mapper
  //       i.e bringing and relating H3 data is not
  /**
   * @description Get a Indicator Hashmap to relate Indicator Records with Indicators by the Name Code
   */
  async getIndicatorMap(): Promise<Record<string, any>> {
    const indicators: IndicatorNameCodeWithRelatedH3[] =
      await this.indicatorService.getIndicatorsAndRelatedH3DataIds();
    const indicatorMap: Record<string, any> = {};
    indicators.forEach(
      (indicator: { id: string; nameCode: string; h3DataId: string }) => {
        indicatorMap[indicator.nameCode] = indicator;
      },
    );
    return indicatorMap;
  }

  async calculateImpactWithNewMethodology(
    activeIndicators: Indicator[],
  ): Promise<void> {
    return this.impactCalculator.calculateImpactForAllSourcingRecords(
      activeIndicators,
    );
  }

  async updateImpactView(): Promise<void> {
    return this.dataSource.query(
      `REFRESH MATERIALIZED VIEW CONCURRENTLY ${IMPACT_VIEW_NAME} WITH DATA`,
    );
  }
}
