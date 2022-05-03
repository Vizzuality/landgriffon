import { EntityRepository, Repository } from 'typeorm';
import { IndicatorRecord } from 'modules/indicator-records/indicator-record.entity';
import { Logger, ServiceUnavailableException } from '@nestjs/common';
import { IndicatorComputedRawDataDto } from 'modules/indicators/dto/indicator-computed-raw-data.dto';
import { SourcingRecordsWithIndicatorRawDataDto } from 'modules/sourcing-records/dto/sourcing-records-with-indicator-raw-data.dto';
import { MissingH3DataError } from 'modules/indicator-records/errors/missing-h3-data.error';

@EntityRepository(IndicatorRecord)
export class IndicatorRecordRepository extends Repository<IndicatorRecord> {
  logger: Logger = new Logger(IndicatorRecordRepository.name);

  /**
   * @description Retrieves data to calculate Indicator Records for all Sourcing Records present in the DB
   * Uses stored functions created with migration: 1645259040554-ImpactStoredFunctions.ts
   */
  async getIndicatorRawDataForAllSourcingRecords(): Promise<
    SourcingRecordsWithIndicatorRawDataDto[]
  > {
    try {
      const response: any = await this.query(`
      SELECT
          sr.id as "sourcingRecordId",
          sr.tonnage,
          sr.year,
          sl.id as "sourcingLocationId",
          sl.production,
          sl."harvestedArea",
          sl."rawDeforestation",
          sl."rawBiodiversity",
          sl."rawCarbon",
          sl."rawWater"
      FROM
          sourcing_records sr
          INNER JOIN
              (
                  SELECT
                      id,
                      sum_material_over_georegion("geoRegionId", "materialId", 'producer') as production,
                      sum_material_over_georegion("geoRegionId", "materialId", 'harvest') as "harvestedArea",
                      sum_weighted_deforestation_over_georegion("geoRegionId", "materialId", 'harvest') as "rawDeforestation",
                      sum_weighted_biodiversity_over_georegion("geoRegionId", "materialId", 'harvest') as "rawBiodiversity",
                      sum_weighted_carbon_over_georegion("geoRegionId", "materialId", 'harvest') as "rawCarbon",
                      sum_weighted_water_over_georegion("geoRegionId") as "rawWater",
                      "scenarioInterventionId",
                      "interventionType"
                  FROM
                      sourcing_location
                  WHERE "scenarioInterventionId" IS NULL
                  AND "interventionType" IS NULL
              ) as sl
              on sr."sourcingLocationId" = sl.id`);
      if (!response.length)
        this.logger.warn(
          `Could not retrieve Sourcing Records with weighted indicator values`,
        );

      return response;
    } catch (err: any) {
      this.logger.error(
        `Error querying data from DB to calculate Indicator Records: ${err.message}`,
      );
      throw new MissingH3DataError(
        `Could net retrieve Indicator Raw data from Sourcing Locations: ${err}`,
      );
    }
  }

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
