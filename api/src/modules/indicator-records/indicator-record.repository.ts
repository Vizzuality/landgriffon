import { EntityRepository, Repository } from 'typeorm';
import { IndicatorRecord } from 'modules/indicator-records/indicator-record.entity';
import { Logger } from '@nestjs/common';

@EntityRepository(IndicatorRecord)
export class IndicatorRecordRepository extends Repository<IndicatorRecord> {
  logger: Logger = new Logger(IndicatorRecordRepository.name);

  /**
   * @description Calculate Raw Indicator values given a GeoRegion Id and Material Id:
   * @todo: This most likely will change to fit PR: https://github.com/Vizzuality/landgriffon/pull/231/
   *        once it's merged
   *
   *@todo: Add proper typing when functionally validated with Science
   */
  async getIndicatorRawDataByGeoRegionAndMaterial(
    geoRegionId: string,
    materialId: string,
  ): Promise<any> {
    try {
      const res: any = await this.query(
        `
                 SELECT
                      sum_material_over_georegion($1, $2, 'producer') as production,
                      sum_material_over_georegion($1, $2, 'harvest') as "harvestedArea",
                      sum_weighted_deforestation_over_georegion($1, $2, 'harvest') as "rawDeforestation",
                      sum_weighted_biodiversity_over_georegion($1, $2, 'harvest') as "rawBiodiversity",
                      sum_weighted_carbon_over_georegion($1, $2, 'harvest') as "rawCarbon",
                      sum_weighted_water_over_georegion($1) as "rawWater"
                 `,
        [geoRegionId, materialId],
      );
      return res;
    } catch (error: any) {
      this.logger.error(
        `Could not calculate raw Indicator values for GeoRegion Id: ${geoRegionId} and Material Id: ${materialId} `,
      );
    }
  }
}
