// 	•	get_annual_commodity_weighted_impact_over_georegion
// 	•	get_indicator_coefficient_impact
// 	•	get_annual_commodity_weighted_material_impact_over_georegion
// 	•	get_annual_unweighted_impact_over_georegion

import { GeoRegionId } from './production-and-harvest.query';
import { INDICATOR_NAME_CODES } from '../../../indicators/indicator.entity';
import { DataSource } from 'typeorm';
import {
  IndicatorH3DataSource,
  MaterialH3DataSource,
} from '../impact-calculation.repository';
import { TinyTypeOf } from 'tiny-types';

export class TotalWeightedImpact extends TinyTypeOf<number>() {}

export class AnnualCommodityWeightedImpactQuery {
  constructor(private readonly dataSource: DataSource) {}

  async getAnnualCommodityWeightedImpactOverGeoRegion(
    indicatorH3DataSouce: IndicatorH3DataSource,
    materialH3DataSource: MaterialH3DataSource,
    geoRegionH3IndexList: GeoRegionId,
  ): Promise<TotalWeightedImpact> {
    const res: { total_weighted_impact: number }[] =
      await this.dataSource.query(
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

    return new TotalWeightedImpact(res[0].total_weighted_impact);
  }
}
