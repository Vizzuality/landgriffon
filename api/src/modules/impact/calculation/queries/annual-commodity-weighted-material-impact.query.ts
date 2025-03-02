// 	•	get_annual_commodity_weighted_impact_over_georegion
// 	•	get_indicator_coefficient_impact
// 	•	get_annual_commodity_weighted_material_impact_over_georegion
// 	•	get_annual_unweighted_impact_over_georegion

import { GeoRegionId } from './production-and-harvest.query';
import { DataSource } from 'typeorm';
import {
  IndicatorH3DataSource,
  MaterialIndicatorH3DataSource,
} from '../impact-calculation.repository';
import {
  ImpactRawDataComputingError,
  TotalWeightedImpact,
} from './annual-commodity-weighted-impact.query';

// TODO: this is a slightly different approach: it uses the material_to_indicator relation. document properly
//       the query itself its the same, the difference is the material h3 datasource. here we use the material_to_indicator

export class AnnualCommodityWeightedMaterialImpactQuery {
  constructor(private readonly dataSource: DataSource) {}

  // TODO: This probably needs better naming, smth more related to ImpactRawData
  async getAnnualCommodityWeightedImpactOverGeoRegion(
    indicatorH3DataSouce: IndicatorH3DataSource,
    materialToIndicatorH3DataSource: MaterialIndicatorH3DataSource,
    geoRegionH3IndexList: GeoRegionId,
  ): Promise<TotalWeightedImpact> {
    const res: { total_weighted_impact: number }[] =
      await this.dataSource.query(
        `
      SELECT
      SUM(h3ind."${indicatorH3DataSouce.columnName}" * h3prod."${materialToIndicatorH3DataSource.columnName}") AS total_weighted_impact
      FROM ${indicatorH3DataSouce.tableName} h3ind
      INNER JOIN ${materialToIndicatorH3DataSource.tableName} h3prod
      ON h3prod.h3index = h3ind.h3index
      WHERE h3ind.h3index = ANY($1);
      `,
        [geoRegionH3IndexList.value],
      );
    if (!res.length) {
      throw new ImpactRawDataComputingError(
        `Could not compute Impact Raw Data trying to fetch from indicator h3 source: ${indicatorH3DataSouce.tableName}.${indicatorH3DataSouce.columnName} and material h3 source: ${materialToIndicatorH3DataSource.tableName}.${materialToIndicatorH3DataSource.columnName}`,
      );
    }

    return new TotalWeightedImpact(res[0].total_weighted_impact);
  }
}
