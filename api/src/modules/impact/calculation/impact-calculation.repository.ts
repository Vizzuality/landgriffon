import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  ImpactQueryBuilderV2,
  ImpactQueryDependency,
} from 'modules/impact/calculation/impact-calculation.query.builder';
import { SourcingRecordsWithIndicatorRawData } from 'modules/sourcing-records/dto/sourcing-records-with-indicator-raw-data.dto';
import { IndicatorRecord } from '../../indicator-records/indicator-record.entity';
import {
  Indicator,
  INDICATOR_NAME_CODES,
} from '../../indicators/indicator.entity';
import { H3Data, H3DataSource } from '../../h3-data/h3-data.entity';
import {
  MaterialToH3,
  MATERIAL_TO_H3_TYPE,
} from 'modules/materials/material-to-h3.entity';
import {
  GeoRegionId,
  H3DataSourceNotFound,
  MaterialId,
} from './queries/production-and-harvest.query';
import { TinyTypeOf } from 'tiny-types';

export class MaterialH3DataSource extends H3DataSource {}

export class IndicatorH3DataSource extends H3DataSource {}

// TODO: Idea: Since this goes by location, we could store all uncompacted h3 so that we avoid recalculating them for each store procedure that runs for a sinlge
export class GeoRegionH3IndexList extends TinyTypeOf<string[]>() {}

export class GetGeoRegionH3IndexListParams {
  geoRegionId: GeoRegionId;
  resolution?: number;
}

@Injectable()
export class ImpactCalculationRepository {
  logger: Logger = new Logger(ImpactCalculationRepository.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly impactQueryBuilder: ImpactQueryBuilderV2,
  ) {}

  async calculateRawImpact(
    queryDependencies: ImpactQueryDependency[],
  ): Promise<SourcingRecordsWithIndicatorRawData[]> {
    const query = this.impactQueryBuilder.buildQuery(queryDependencies);
    try {
      const result: SourcingRecordsWithIndicatorRawData[] =
        await this.dataSource.query(query);
      return result;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async saveImpactRecords(indicatorRecords: IndicatorRecord[]): Promise<void> {
    await this.dataSource
      .getRepository(IndicatorRecord)
      .insert(indicatorRecords);
  }

  async getIndicatorH3DataSource(
    nameCode: INDICATOR_NAME_CODES,
  ): Promise<IndicatorH3DataSource> {
    const res = await this.dataSource
      .createQueryBuilder(H3Data, 'h3')
      .leftJoin(Indicator, 'indicator', 'h3.indicatorId = indicator.id')
      .select(['h3.h3tableName as tableName', 'h3.h3columnName as columnName'])
      .where('indicator."nameCode" = :nameCode', {
        nameCode,
      })
      .getRawOne<IndicatorH3DataSource>();
    if (!res) {
      throw new Error(`No H3 data source found for indicator ${nameCode}`);
    }
    return res;
  }

  // TODO: A first step to remove redundant queries would be to, for the same material and type, map the h3 datasource, so we can reuse it
  async getMaterialH3DataSource(
    materialId: MaterialId,
    type: MATERIAL_TO_H3_TYPE,
  ): Promise<MaterialH3DataSource> {
    const res = await this.dataSource
      .createQueryBuilder(H3Data, 'h3')
      .leftJoin(MaterialToH3, 'materialh3', 'materialh3.h3DataId = h3.id')
      .select(['h3.h3tableName as tableName', 'h3.h3columnName as columnName'])
      .where('materialh3.materialId = :materialId', {
        materialId: materialId.value,
      })
      .andWhere('materialh3.type = :type', { type })
      .getRawOne<MaterialH3DataSource>();
    if (!res) {
      throw new H3DataSourceNotFound(
        `No H3 Data found for material ${materialId.value} and type ${type}`,
      );
    }
    return res;
  }

  async getGeoRegionH3IndexList(
    dto: GetGeoRegionH3IndexListParams,
  ): Promise<GeoRegionH3IndexList> {
    const geoRegionId = dto.geoRegionId.value;
    const resolution = dto.resolution ?? 6;
    // TODO: not sure if we need to add a resolution parameter here, check uncompact docs
    const res: { h3index: string }[] = await this.dataSource.query(
      `SELECT h3_uncompact(gr."h3Compact"::h3index[], $1) AS h3index
       FROM geo_region gr
       WHERE gr.id = $2;
      `,
      [resolution, geoRegionId],
    );
    if (!res.length) {
      throw new Error(`No h3 indices found for geo region ${geoRegionId}`);
    }
    return new GeoRegionH3IndexList(res.map((h3) => h3.h3index));
  }
}
