import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import {
  Indicator,
  INDICATOR_NAME_CODES,
} from 'modules/indicators/indicator.entity';
import { H3Data, H3DataSource } from 'modules/h3-data/h3-data.entity';
import {
  MATERIAL_TO_H3_TYPE,
  MaterialToH3,
} from 'modules/materials/material-to-h3.entity';
import { TinyTypeOf } from 'tiny-types';
import { MaterialIndicatorToH3 } from 'modules/materials/material-indicator-to-h3.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as crypto from 'crypto';

export class MaterialH3DataSource extends H3DataSource {}
export class IndicatorH3DataSource extends H3DataSource {}
export class MaterialIndicatorH3DataSource extends H3DataSource {}

export class H3GridSum extends TinyTypeOf<number>() {}
export class GeoRegionH3IndexList extends TinyTypeOf<string[]>() {}
export class IndicatorCoefficientImpactValue extends TinyTypeOf<number>() {}
export class TotalWeightedImpact extends TinyTypeOf<number>() {}

export class DistributedImpactValue extends TinyTypeOf<number>() {}

export class H3DataId extends TinyTypeOf<string>() {}
export class MaterialId extends TinyTypeOf<string>() {}
export class GeoRegionId extends TinyTypeOf<string>() {}
export class IndicatorId extends TinyTypeOf<string>() {}
export class AdminRegionId extends TinyTypeOf<string>() {}

interface IndicatorCoefficientImpactQueryParams {
  indicatorId: IndicatorId;
  materialId: MaterialId;
  adminRegionId: AdminRegionId;
}

export class SumH3GridOverGeoRegionParams {
  geoRegionH3IndexList: GeoRegionH3IndexList;
  materialH3DataSource: MaterialH3DataSource;
}

export class GetGeoRegionH3IndexListParams {
  geoRegionId: GeoRegionId;
  resolution?: number;
}
export interface DistributedImpactQueryParams {
  indicatorNameCode: INDICATOR_NAME_CODES;
  geoRegionH3IndexList: GeoRegionH3IndexList;
  indicatorH3DataSource: IndicatorH3DataSource;
}

export class H3DataSourceNotFound extends NotFoundException {
  constructor(message?: string) {
    super(message);
  }
}

export class ImpactRawDataComputingError extends Error {}

@Injectable()
export class ImpactCalculationRepository {
  logger: Logger = new Logger(ImpactCalculationRepository.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  hashKey(...params: any[]): string {
    return crypto.createHash('sha256').update(params.join('-')).digest('hex');
  }

  async getIndicatorH3DataSource(
    nameCode: INDICATOR_NAME_CODES,
  ): Promise<IndicatorH3DataSource> {
    const hashKey = this.hashKey('getIndicatorH3DataSource', nameCode);
    const value = await this.cacheManager.get<IndicatorH3DataSource>(hashKey);
    if (value !== undefined && value !== null) {
      return value;
    }

    const res = await this.dataSource
      .createQueryBuilder(H3Data, 'h3')
      .leftJoin(Indicator, 'indicator', 'h3.indicatorId = indicator.id')
      .select([
        'h3.id as "id"',
        'h3.h3tableName as "tableName"',
        'h3.h3columnName as "columnName"',
      ])
      .where('indicator."nameCode" = :nameCode', {
        nameCode,
      })
      .getRawOne();
    if (!res) {
      throw new Error(`No H3 data source found for indicator ${nameCode}`);
    }

    const result = {
      id: new H3DataId(res.id),
      tableName: res.tableName,
      columnName: res.columnName,
    };

    await this.cacheManager.set<IndicatorH3DataSource>(hashKey, result);

    return result;
  }

  async getMaterialH3DataSource(
    materialId: MaterialId,
    type: MATERIAL_TO_H3_TYPE,
  ): Promise<MaterialH3DataSource> {
    const hashKey = this.hashKey('getMaterialH3DataSource', materialId, type);
    const value = await this.cacheManager.get<MaterialH3DataSource>(hashKey);
    if (value !== undefined && value !== null) {
      return value;
    }

    const res = await this.dataSource
      .createQueryBuilder(H3Data, 'h3')
      .leftJoin(MaterialToH3, 'materialh3', 'materialh3.h3DataId = h3.id')
      .select([
        'h3.id as "id"',
        'h3.h3tableName as "tableName"',
        'h3.h3columnName as "columnName"',
      ])
      .where('materialh3.materialId = :materialId', {
        materialId: materialId.value,
      })
      .andWhere('materialh3.type = :type', { type })
      .getRawOne();
    if (!res) {
      throw new H3DataSourceNotFound(
        `No H3 Data found for material ${materialId.value} and type ${type}`,
      );
    }
    const result = {
      id: new H3DataId(res.id),
      tableName: res.tableName,
      columnName: res.columnName,
    };

    await this.cacheManager.set<MaterialH3DataSource>(hashKey, result);

    return result;
  }

  async getMaterialIndicatorH3DataSource(
    indicatorId: IndicatorId,
    materialId: MaterialId,
  ): Promise<MaterialIndicatorH3DataSource> {
    const hashKey = this.hashKey(
      'getMaterialH3DataSource',
      indicatorId,
      materialId,
    );
    const value = await this.cacheManager.get<MaterialIndicatorH3DataSource>(
      hashKey,
    );
    if (value !== undefined && value !== null) {
      return value;
    }

    const query = this.dataSource
      .createQueryBuilder(H3Data, 'h3')
      .innerJoin(
        MaterialIndicatorToH3,
        'materialIndicatorH3',
        'materialIndicatorH3.h3DataId = h3.id',
      )
      .select([
        'h3.id as "id"',
        'h3.h3tableName as "tableName"',
        'h3.h3columnName as "columnName"',
      ])
      .innerJoin(Indicator, 'indicator', 'h3.indicatorId = indicator.id')
      .where('indicator.id = :indicatorId', { indicatorId: indicatorId.value })
      .andWhere('materialIndicatorH3.materialId = :materialId', {
        materialId: materialId.value,
      });
    const res = await query.getRawOne<MaterialIndicatorH3DataSource>();

    if (!res) {
      throw new H3DataSourceNotFound(
        `No Material+Indicator H3 Data found for material ${materialId.value} and indicator ${indicatorId.value}`,
      );
    }

    await this.cacheManager.set<MaterialIndicatorH3DataSource>(hashKey, res);

    return res;
  }

  async getGeoRegionH3IndexList(
    dto: GetGeoRegionH3IndexListParams,
  ): Promise<GeoRegionH3IndexList> {
    const geoRegionId = dto.geoRegionId.value;
    const resolution = dto.resolution ?? 6;

    const hashKey = this.hashKey(
      'getGeoRegionH3IndexList',
      geoRegionId,
      resolution,
    );
    const value = await this.cacheManager.get<GeoRegionH3IndexList>(hashKey);
    if (value !== undefined && value !== null) {
      return value;
    }

    // TODO: not sure if we need to add a resolution parameter here, check uncompact docs
    const res: { h3index: string }[] = await this.dataSource.query(
      `SELECT h3_uncompact(gr."h3Compact"::h3index[], $1) AS h3index
       FROM geo_region gr
       WHERE gr.id = $2;
      `,
      [resolution, geoRegionId],
    );
    if (!res.length) {
      throw new Error(
        `Couldn't featch H3 index list for geo region ${geoRegionId}`,
      );
    }
    const result = new GeoRegionH3IndexList(res.map((h3) => h3.h3index));
    await this.cacheManager.set<GeoRegionH3IndexList>(hashKey, result);
    return result;
  }

  /**
   * @description: Sums the values of a given h3 grid over a georegion. Uncompacts the h3 indices from a given georegion and uses them to join with the h3 grid table.
   * @returns: The sum of the values of the matching h3 grid cells.
   * @param params
   */
  // replicates sum_h3_grid_over_georegion
  async sumH3GridOverGeoRegion(
    params: SumH3GridOverGeoRegionParams,
  ): Promise<H3GridSum> {
    const { geoRegionH3IndexList, materialH3DataSource } = params;

    const hashKey = this.hashKey(geoRegionH3IndexList, materialH3DataSource);
    const value = await this.cacheManager.get<H3GridSum>(hashKey);
    if (value !== undefined && value !== null) {
      return value;
    }

    // TODO: After testing and compary, probably use here WHERE h3.index = ANY($1) instead of INNER JOIN over known h3 indices
    const res = await this.dataSource.query(
      `
      SELECT SUM(h3grid."${materialH3DataSource.columnName}") AS total_sum
      FROM (
        SELECT unnest($1::h3index[]) AS h3index
      ) AS geo_region
      INNER JOIN ${materialH3DataSource.tableName} h3grid
      ON h3grid.h3index = geo_region.h3index;
  `,
      [geoRegionH3IndexList.value],
    );

    if (!res.length) {
      throw new ImpactRawDataComputingError(
        `Could not compute Impact Raw Data trying to fetch from material h3 source: ${materialH3DataSource.tableName}.${materialH3DataSource.columnName}`,
      );
    }

    // TODO should we check for nulls and pass 0 instead?
    const result = new H3GridSum(res[0].total_sum ?? 0);

    await this.cacheManager.set(hashKey, result);

    return result;
  }

  async getAnnualCommodityWeightedImpactOverGeoRegion(
    indicatorH3DataSouce: IndicatorH3DataSource,
    materialH3DataSource: MaterialH3DataSource,
    geoRegionH3IndexList: GeoRegionH3IndexList,
  ): Promise<TotalWeightedImpact> {
    const hashKey = this.hashKey(
      indicatorH3DataSouce,
      materialH3DataSource,
      geoRegionH3IndexList,
    );
    const value = await this.cacheManager.get<TotalWeightedImpact>(hashKey);
    if (value !== undefined && value !== null) {
      return value;
    }

    let res: { total_weighted_impact: number }[];
    try {
      res = await this.dataSource.query(
        `
      SELECT
      SUM(h3ind."${indicatorH3DataSouce.columnName}" * h3prod."${materialH3DataSource.columnName}") AS total_weighted_impact
      FROM ${indicatorH3DataSouce.tableName} h3ind
      INNER JOIN ${materialH3DataSource.tableName} h3prod
      ON h3prod.h3index = h3ind.h3index
      WHERE h3ind.h3index = ANY($1);
      `,
        [geoRegionH3IndexList.value],
      );
      if (!res.length) {
        throw new ImpactRawDataComputingError(
          `Could not compute Impact Raw Data trying to fetch from indicator h3 source: ${indicatorH3DataSouce.tableName}.${indicatorH3DataSouce.columnName} and material h3 source: ${materialH3DataSource.tableName}.${materialH3DataSource.columnName}`,
        );
      }
      const result = new TotalWeightedImpact(res[0].total_weighted_impact ?? 0);

      await this.cacheManager.set<TotalWeightedImpact>(hashKey, result);

      return result;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async getIndicatorCoefficientImpact(
    params: IndicatorCoefficientImpactQueryParams,
  ): Promise<IndicatorCoefficientImpactValue> {
    const indicatorId = params.indicatorId.value;
    const adminRegionId = params.adminRegionId.value;
    const materialId = params.materialId.value;

    const hashKey = this.hashKey(indicatorId, adminRegionId, materialId);
    const value = await this.cacheManager.get<IndicatorCoefficientImpactValue>(
      hashKey,
    );
    if (value !== undefined && value !== null) {
      return value;
    }

    const query: string = `
      WITH RECURSIVE
        region_tree AS (SELECT id, "parentId", 0 AS level
                        FROM admin_region
                        WHERE id = $2

                        UNION ALL

                        SELECT ar.id, ar."parentId", rt.level + 1
                        FROM admin_region ar
                               INNER JOIN region_tree rt ON ar.id = rt."parentId"),
        candidate_values AS (SELECT ic."value" AS candidate_value, rt.level
                             FROM region_tree rt
                                    JOIN indicator_coefficient ic ON ic."adminRegionId" = rt.id
                             WHERE ic."materialId" = $3
                               AND ic."indicatorId" = $1
                               AND ic."value" IS NOT NULL

                             UNION ALL

                             SELECT ic."value" AS candidate_value, 9999 AS level
                             FROM indicator_coefficient ic
                             WHERE ic."adminRegionId" IS NULL
                               AND ic."materialId" = $3
                               AND ic."indicatorId" = $1
                               AND ic."value" IS NOT NULL)
      SELECT candidate_value AS value
      FROM candidate_values
      ORDER BY level ASC
        LIMIT 1;
    `;
    const res: { value: number }[] = await this.dataSource.query(query, [
      indicatorId,
      adminRegionId,
      materialId,
    ]);

    // TODO should we check for nulls and pass 0 instead?
    if (!res.length) {
      throw new ImpactRawDataComputingError(
        `No indicator coefficient impact found for indicator ${indicatorId}, material ${materialId} and admin region ${adminRegionId}`,
      );
    }

    // TODO should we check for nulls and pass 0 instead?
    const result = new IndicatorCoefficientImpactValue(res[0].value ?? 0);

    await this.cacheManager.set(hashKey, result);

    return result;
  }

  async getDistributedImpactOverGeoRegion(
    indicatorH3DataSource: IndicatorH3DataSource,
    geoRegionH3IndexList: GeoRegionH3IndexList,
  ): Promise<DistributedImpactValue> {
    const hashKey = this.hashKey(
      `getDistributedImpactOverGeoRegion`,
      indicatorH3DataSource,
      geoRegionH3IndexList,
    );
    const value = await this.cacheManager.get<DistributedImpactValue>(hashKey);
    if (value !== undefined && value !== null) {
      return value;
    }

    const res: { total_unweighted_impact: number }[] =
      await this.dataSource.query(
        `
      SELECT
        SUM(h3ind."${indicatorH3DataSource.columnName}") / COUNT(*) AS total_unweighted_impact
      FROM ${indicatorH3DataSource.tableName} h3ind
      WHERE h3ind.h3index = ANY($1);
      `,
        [geoRegionH3IndexList],
      );
    if (!res.length) {
      throw new ImpactRawDataComputingError(
        `Could not compute Distributed Impact Raw Data trying to fetch from indicator h3 source: ${indicatorH3DataSource.tableName}.${indicatorH3DataSource.columnName}`,
      );
    }

    // TODO should we check for nulls and pass 0 instead?
    const result = new DistributedImpactValue(
      res[0].total_unweighted_impact ?? 0,
    );

    await this.cacheManager.set(hashKey, result);

    return result;
  }

  async getBWSInStressedAreasOverGeoregion(
    params: DistributedImpactQueryParams,
  ): Promise<DistributedImpactValue> {
    const { indicatorH3DataSource, geoRegionH3IndexList } = params;

    const hashKey = this.hashKey(
      `getBWSInStressedAreasOverGeoregion`,
      indicatorH3DataSource,
      geoRegionH3IndexList,
    );
    const value = await this.cacheManager.get<DistributedImpactValue>(hashKey);
    if (value !== undefined && value !== null) {
      return value;
    }

    const res: { total_unweighted_impact: number }[] =
      await this.dataSource.query(
        `
      SELECT
        SUM(h3ind."${indicatorH3DataSource.columnName}") / COUNT(*) AS total_unweighted_impact
      FROM ${indicatorH3DataSource.tableName} h3ind
      WHERE h3ind.h3index = ANY($1)
        AND (h3ind."${indicatorH3DataSource.columnName}" > 0.4 AND h3ind."${indicatorH3DataSource.columnName}" < 9999);
      `,
        [geoRegionH3IndexList],
      );
    if (!res.length) {
      throw new ImpactRawDataComputingError(
        `Could not compute BWS In Stressed Areas Impact Raw Data trying to fetch from indicator h3 source: ${indicatorH3DataSource.tableName}.${indicatorH3DataSource.columnName}`,
      );
    }

    // TODO should we check for nulls and pass 0 instead?
    const result = new DistributedImpactValue(
      res[0].total_unweighted_impact ?? 0,
    );

    await this.cacheManager.set(hashKey, result);

    return result;
  }

  async getStressedAreaPortionOverGeoregion(
    params: DistributedImpactQueryParams,
  ): Promise<DistributedImpactValue> {
    const { indicatorH3DataSource, geoRegionH3IndexList } = params;

    const hashKey = this.hashKey(
      `getStressedAreaPortionOverGeoregion`,
      indicatorH3DataSource,
      geoRegionH3IndexList,
    );
    const value = await this.cacheManager.get<DistributedImpactValue>(hashKey);
    if (value !== undefined && value !== null) {
      return value;
    }

    const res: { total_unweighted_impact: number }[] =
      await this.dataSource.query(
        `
      SELECT
        SUM(CASE WHEN h3ind."${indicatorH3DataSource.columnName}" > 0.4
                  AND h3ind."${indicatorH3DataSource.columnName}" < 9999 THEN 1 ELSE 0 END
            )::float/count(*)::float
      FROM ${indicatorH3DataSource.tableName} h3ind
      WHERE h3ind.h3index = ANY($1)
      `,
        [geoRegionH3IndexList],
      );
    if (!res.length) {
      throw new ImpactRawDataComputingError(
        `Could not compute Stressed Area Portion Impact Raw Data trying to fetch from indicator h3 source: ${indicatorH3DataSource.tableName}.${indicatorH3DataSource.columnName}`,
      );
    }

    // TODO should we check for nulls and pass 0 instead?
    const result = new DistributedImpactValue(
      res[0].total_unweighted_impact ?? 0,
    );

    await this.cacheManager.set(hashKey, result);

    return result;
  }
}
