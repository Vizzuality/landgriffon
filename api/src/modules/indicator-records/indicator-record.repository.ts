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
          slwithmaterialh3data.id as "sourcingRecordId",
          sr.tonnage,
          sr.year,
          sr.id as "sourcingLocationId",
          slwithmaterialh3data.production,
          slwithmaterialh3data."harvestedArea",
          slwithmaterialh3data."rawDeforestation",
          slwithmaterialh3data."rawBiodiversity",
          slwithmaterialh3data."rawCarbon",
          slwithmaterialh3data."rawWater",
          slwithmaterialh3data."materialH3DataId"
      FROM
          sourcing_records sr
          INNER JOIN
              (
                  SELECT
                      sourcing_location.id,
                      sum_material_over_georegion(sourcing_location."geoRegionId", sourcing_location."materialId", 'producer') as production,
                      sum_material_over_georegion(sourcing_location."geoRegionId", sourcing_location."materialId", 'harvest') as "harvestedArea",
                      sum_weighted_deforestation_over_georegion(sourcing_location."geoRegionId", sourcing_location."materialId", 'harvest') as "rawDeforestation",
                      sum_weighted_biodiversity_over_georegion(sourcing_location."geoRegionId", sourcing_location."materialId", 'harvest') as "rawBiodiversity",
                      sum_weighted_carbon_over_georegion(sourcing_location."geoRegionId", sourcing_location."materialId", 'harvest') as "rawCarbon",
                      sum_weighted_water_over_georegion(sourcing_location."geoRegionId") as "rawWater",
                      "scenarioInterventionId",
                      "interventionType",
                      mth."h3DataId" as "materialH3DataId"
                  FROM
                      sourcing_location
                  inner join
                    material_to_h3 mth
                  on
                    mth."materialId" = sourcing_location."materialId"
                  WHERE "scenarioInterventionId" IS NULL
                  AND "interventionType" IS NULL
              ) as slwithmaterialh3data
              on sr."sourcingLocationId" = slwithmaterialh3data.id`);
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
