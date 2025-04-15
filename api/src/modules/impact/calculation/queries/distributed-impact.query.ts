import { TinyTypeOf } from 'tiny-types';
import { DataSource } from 'typeorm';
import {
  GeoRegionH3IndexList,
  IndicatorH3DataSource,
} from '../impact-calculation.repository';
import { ImpactRawDataComputingError } from './annual-commodity-weighted-impact.query';

export interface DistributedImpactQueryParams {
  geoRegionH3IndexList: GeoRegionH3IndexList;
  indicatorH3DataSource: IndicatorH3DataSource;
}

export class DistributedImpactValue extends TinyTypeOf<number>() {}

//replicates get_annual_unweighted_impact_over_georegion
export class DistributedImpactQuery {
  constructor(private readonly dataSource: DataSource) {}

  async getDistributedImpactOverGeoRegion(
    params: DistributedImpactQueryParams,
  ): Promise<DistributedImpactValue> {
    const geoRegionH3IndexList = params.geoRegionH3IndexList.value;
    const indicatorH3DataSource = params.indicatorH3DataSource;
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

    return new DistributedImpactValue(res[0].total_unweighted_impact);
  }
}
