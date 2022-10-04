import { EntityRepository, SelectQueryBuilder } from 'typeorm';
import { IndicatorRecord } from 'modules/indicator-records/indicator-record.entity';
import { Logger, ServiceUnavailableException } from '@nestjs/common';
import {
  SourcingRecordsWithIndicatorRawDataDto,
  SourcingRecordsWithIndicatorRawDataDtoV2,
} from 'modules/sourcing-records/dto/sourcing-records-with-indicator-raw-data.dto';
import { MissingH3DataError } from 'modules/indicator-records/errors/missing-h3-data.error';
import { H3Data } from 'modules/h3-data/h3-data.entity';
import { INDICATOR_TYPES } from 'modules/indicators/indicator.entity';
import { MATERIAL_TO_H3_TYPE } from 'modules/materials/material-to-h3.entity';
import { IndicatorRecordValueSQLStrategies } from 'modules/indicator-records/strategies/indicator-record-value.strategies';
import { AppBaseRepository } from 'utils/app-base.repository';

@EntityRepository(IndicatorRecord)
export class IndicatorRecordRepository extends AppBaseRepository<IndicatorRecord> {
  logger: Logger = new Logger(IndicatorRecordRepository.name);

  async getIndicatorRawDataForAllSourcingRecords(): Promise<
    SourcingRecordsWithIndicatorRawDataDto[]
  > {
    try {
      // TODO due to possible performance issues this query that makes use of the stored procedures for
      // indicator value calculation has not been refactored. It remains to be reworked
      const response: any = await this.query(`
        SELECT
          -- TODO: Hack to retrieve 1 materialH3Id for each sourcingRecord. This should include a year fallback strategy in the stored procedures
          --       used below
          distinct on (sr.id)
          sr.id as "sourcingRecordId",
          sr.tonnage,
          sr.year,
          slwithmaterialh3data.id as "sourcingLocationId",
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
                  and mth."type" = 'harvest'
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
   * @description Retrieves data to calculate Indicator Records for all Sourcing Records present in the DB
   * Uses stored functions created with migration: 1645259040554-ImpactStoredFunctions.ts
   */
  async getIndicatorRawDataForAllSourcingRecordsV2(): Promise<
    SourcingRecordsWithIndicatorRawDataDtoV2[]
  > {
    try {
      // TODO due to possible performance issues this query that makes use of the stored procedures for
      // indicator value calculation has not been refactored. It remains to be reworked
      const response: any = await this.query(`
        SELECT
          -- TODO: Hack to retrieve 1 materialH3Id for each sourcingRecord. This should include a year fallback strategy in the stored procedures
          --       used below
          distinct on (sr.id)
          sr.id as "sourcingRecordId",
          sr.tonnage,
          sr.year,
          slwithmaterialh3data.id as "sourcingLocationId",
          slwithmaterialh3data.production,
          slwithmaterialh3data."harvestedArea",
          slwithmaterialh3data."weightedAllHarvest",
          slwithmaterialh3data."rawDeforestation",
          slwithmaterialh3data."waterStressPerct",
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
                      sum_h3_weighted_cropland_area(sourcing_location."geoRegionId", sourcing_location."materialId", 'producer') as "weightedAllHarvest",
                      sum_weighted_deforestation_over_georegion(sourcing_location."geoRegionId", sourcing_location."materialId", 'producer') as "rawDeforestation",
                      sum_weighted_carbon_over_georegion(sourcing_location."geoRegionId", sourcing_location."materialId", 'producer') as "rawCarbon",
                      get_percentage_water_stress_area(sourcing_location."geoRegionId") as "waterStressPerct",
                      get_blwf_impact(sourcing_location."adminRegionId", sourcing_location."materialId") as "rawWater",
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
                  and mth."type" = 'producer'
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
   * Calculates the impact raw value for the given indicator type and georegion, and basing the calculations
   * on the provided H3 Data of materials and indicators (since the calculation might have dependencies on other
   * indicators)
   * @param geoRegionId
   * @param indicatorType
   * @param indicatorH3s
   * @param materialH3s
   */
  async getIndicatorRecordRawValue(
    geoRegionId: string,
    indicatorType: INDICATOR_TYPES,
    indicatorH3s: Map<INDICATOR_TYPES, H3Data>,
    materialH3s: Map<MATERIAL_TO_H3_TYPE, H3Data>,
  ): Promise<number> {
    const query: SelectQueryBuilder<any> = IndicatorRecordValueSQLStrategies[
      indicatorType
    ](geoRegionId, indicatorH3s, materialH3s);

    try {
      const res: { sum: number }[] = await query.getRawMany();
      return res[0].sum;
    } catch (error: any) {
      this.logger.error(
        `Could not calculate raw Indicator values for GeoRegion Id: ${geoRegionId} and Indicator ${indicatorType} - ${error}`,
      );
      throw new ServiceUnavailableException(
        `Could not calculate Raw Indicator values for new Scenario: ${error.message}`,
      );
    }
  }

  /**
   * Returns the sum of h3 value of a given H3 Data over a georegion
   * @param geoRegionId
   * @param h3Data
   */
  async getH3SumOverGeoRegionSQL(
    geoRegionId: string,
    h3Data: H3Data,
  ): Promise<number> {
    const query: string = `SELECT sum(h3Table."${h3Data.h3columnName}")
      FROM
        get_h3_uncompact_geo_region('${geoRegionId}', ${h3Data.h3resolution}) geo_region
      INNER JOIN
        "${h3Data.h3tableName}" h3Table ON geo_region.h3index = h3Table.h3index`;

    try {
      const res: any[] = await this.query(query);
      return res[0].sum;
    } catch (error: any) {
      this.logger.error(
        `Could not calculate raw Indicator values for GeoRegion Id: ${geoRegionId} and H3 Data Id: ${h3Data.id} `,
      );
      throw new ServiceUnavailableException(
        `Could not calculate H3 sum over georegion: ${error.message}`,
      );
    }
  }
}
