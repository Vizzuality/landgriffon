import { EntityRepository, Repository } from 'typeorm';
import { IndicatorRecord } from 'modules/indicator-records/indicator-record.entity';
import { Logger, ServiceUnavailableException } from '@nestjs/common';
import { IndicatorComputedRawDataDto } from 'modules/indicators/dto/indicator-computed-raw-data.dto';

@EntityRepository(IndicatorRecord)
export class IndicatorRecordRepository extends Repository<IndicatorRecord> {
  logger: Logger = new Logger(IndicatorRecordRepository.name);

  /**
   * @description Calculate Raw Indicator values given a GeoRegion Id and Material Id:
   */
  async getIndicatorRawDataByGeoRegionAndMaterial(
    geoRegionId: string,
    materialId: string,
  ): Promise<IndicatorComputedRawDataDto> {
    try {
      const res: IndicatorComputedRawDataDto[] = await this.query(
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
      return res[0];
    } catch (error: any) {
      this.logger.error(
        `Could not calculate raw Indicator values for GeoRegion Id: ${geoRegionId} and Material Id: ${materialId} `,
      );
      throw new ServiceUnavailableException(
        `Could not calculate Raw Indicator values for new Scenario: ${error.message}`,
      );
    }
  }
}
