/**
 * @description: first approach to migrate all stored procedures to regular queries
 */
import { NotFoundException } from '@nestjs/common';
import { TinyTypeOf } from 'tiny-types';
import { DataSource } from 'typeorm';
import {
  MATERIAL_TO_H3_TYPE,
  MaterialToH3,
} from 'modules/materials/material-to-h3.entity';
import { H3Data, H3DataSource } from 'modules/h3-data/h3-data.entity';
import {
  GeoRegionH3IndexList,
  MaterialH3DataSource,
} from '../impact-calculation.repository';
import { IImpactQueryDependency } from './impact-query-dependency.interface';

// •	sum_material_over_georegion
// 	•	get_annual_commodity_weighted_impact_over_georegion
// 	•	get_indicator_coefficient_impact
// 	•	get_annual_commodity_weighted_material_impact_over_georegion
// 	•	get_annual_unweighted_impact_over_georegion

// TODO: I'll do a lot of dirty stuff here, I swear I'll fix it later

export class MaterialId extends TinyTypeOf<string>() {}

export class GeoRegionId extends TinyTypeOf<string>() {}

// TODO: This probably needs better naming
interface H3GridSumResult {
  total_sum: number;
}

export class SumH3GridOverGeoRegionParams {
  geoRegionH3IndexList: GeoRegionH3IndexList;
  h3DataSource: H3DataSource;
}

export class H3DataSourceNotFound extends NotFoundException {
  constructor(message?: string) {
    super(message);
  }
}

export class ProductionOrHarvestQuery {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * sum material over georegion uses: get h3 table for material and sum h3 grid over georegion
   *
   * sum h3 grid over georegion usa get_h3_uncompact etc
   */

  /**
   * @description: Sums the values of a given h3 grid over a georegion. Uncompacts the h3 indices from a given georegion and uses them to join with the h3 grid table.
   * @returns: The sum of the values of the matching h3 grid cells.
   * @param params
   */

  async sumH3GridOverGeoRegion(
    params: SumH3GridOverGeoRegionParams,
  ): Promise<H3GridSumResult> {
    const { geoRegionH3IndexList, h3DataSource } = params;

    // TODO: After testing and compary, probably use here WHERE h3.index = ANY($1) instead of INNER JOIN over known h3 indices
    const res = await this.dataSource.query(
      `
      SELECT SUM(h3grid."${h3DataSource.columnName}") AS total_sum
      FROM (
        SELECT unnest($1::h3index[]) AS h3index
      ) AS geo_region
      INNER JOIN ${h3DataSource.tableName} h3grid
      ON h3grid.h3index = geo_region.h3index;
  `,
      [geoRegionH3IndexList.value],
    );

    return res[0];
  }

  // TODO: this works for harvest as well, we need a better naming, plus it could be removed and use just the other method
  async getProductionOrHarvest(
    geoRegionH3IndexList: GeoRegionH3IndexList,
    materialH3DataSource: MaterialH3DataSource,
  ): Promise<any> {
    const res = await this.sumH3GridOverGeoRegion({
      geoRegionH3IndexList,
      h3DataSource: materialH3DataSource,
    });
    return res;
  }
}
