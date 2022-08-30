import {
  Connection,
  getConnection,
  QueryRunner,
  SelectQueryBuilder,
} from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { MATERIAL_TO_H3_TYPE } from 'modules/materials/material-to-h3.entity';
import { H3Data } from 'modules/h3-data/h3-data.entity';
import { INDICATOR_TYPES } from 'modules/indicators/indicator.entity';
import { SourcingRecordsWithIndicatorRawDataDto } from 'modules/sourcing-records/dto/sourcing-records-with-indicator-raw-data.dto';

@Injectable()
export class ImpactCalculatorService {
  logger: Logger = new Logger(this.constructor.name);

  async calculateImpact(
    connection: Connection,
    queryRunner: QueryRunner,
    georegionId: string,
    materialId: string,
    year: number,
  ): Promise<any[]> {
    // STEPS
    /**
     * 1. Get material h3 data table and column name
     * 1.1 For each year, get the closest available material h3 data
     * 2. Get indicator h3 data table and column name
     * 2.1 For each year, get the closest available material h3 data
     ** Look at how interventions impact calculus implements this.
     *
     * 2.1 Get deforestation indicator h3 data and column name (because this indicator needs to be crossed with this data)
     *
     * CRAZY IDEAZ:
     * 1. We have 12 years to calculate impact: 2010-2022 (12 DB calls)
     * 2. We have 3 available years to calculate impact: 2010, 2014, 2020
     *
     * Before performing any call, can we determine that Sourcing Records from 2010 to 2012 will use data of 2010
     *                                                                    from 2013 to 2017  will use data of 2014
     *                                                                    from 2018 to 2022 will use data of 2022
     *
     * Knowing this, can we calculate impacts for those years simultaneosly (arent we doing that now anyway?) in 3 DB CALLS
     * instead of doing 12, each for one year?
     *
     * LONG STORY SHORT:
     *
     * Can we do as much calls as different h3 data tables we need to attack (in this case 3)
     * instead of doing as much calls as years we have to calculate impact for(in this case 12)
     *
     *There's another problem; every indicator/material might not have data available for the same years, an indicator having
     * data for 2010 and 2020, and another indicator for 2012 and 2017
     * seems like the root of the problem might be pretty early in the process, when deciding what (or more likely when) data to use
     * for calculations
     * what are the possible strategies to calculate the gap years? shgould it be configurable AFTER deployment?
     * closest? that might be resolved by copying columns on the H3 info table on the H3 import
     * mean between the closest ones? that's more difficult, might be possible in the H3 import? but it would be something
     * not configurable once deployed
     *

     *
     */

    const materialH3s: Map<MATERIAL_TO_H3_TYPE, H3Data> =
      await this.getAllMaterialH3sByClosestYear(
        connection,
        queryRunner,
        materialId,
        year,
      );
    const indicatorH3s: Map<INDICATOR_TYPES, H3Data> =
      await this.getIndicatorH3sByTypeAndClosestYear(
        connection,
        queryRunner,
        Object.values(INDICATOR_TYPES),
        year,
      );
    const producerH3: H3Data = materialH3s.get(MATERIAL_TO_H3_TYPE.PRODUCER)!;
    const harvestH3: H3Data = materialH3s.get(MATERIAL_TO_H3_TYPE.HARVEST)!;
    const bioH3: H3Data = indicatorH3s.get(INDICATOR_TYPES.BIODIVERSITY_LOSS)!;
    const deforestH3: H3Data = indicatorH3s.get(INDICATOR_TYPES.DEFORESTATION)!;
    const carbonH3: H3Data = indicatorH3s.get(
      INDICATOR_TYPES.CARBON_EMISSIONS,
    )!;
    const waterH3: H3Data = indicatorH3s.get(
      INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE,
    )!;

    const values: SelectQueryBuilder<unknown> = await connection
      .createQueryBuilder()

      //SELECT aggregation statements
      .select(`sum( "harvestH3"."${harvestH3.h3columnName}" )`, 'harvestedArea')
      .addSelect(
        `sum( "producerH3"."${producerH3.h3columnName}" )`,
        'production',
      )
      .addSelect(
        `sum( "harvestH3"."${harvestH3.h3columnName}" * "deforestH3"."${deforestH3.h3columnName}" ` +
          `* "bioH3"."${bioH3.h3columnName}" * (1/0.0001) )`,
        'rawBiodiversity',
      )
      .addSelect(
        `sum( "harvestH3"."${harvestH3.h3columnName}" * "deforestH3"."${deforestH3.h3columnName}" ` +
          `* "carbonH3"."${carbonH3.h3columnName}")`,
        'rawCarbon',
      )
      .addSelect(
        `sum( "harvestH3"."${harvestH3.h3columnName}" * "deforestH3"."${deforestH3.h3columnName}" )`,
        'rawDeforestation',
      )
      .addSelect(
        `sum( "waterH3"."${waterH3.h3columnName}" * 0.001)`,
        'rawWater',
      )
      //FROM
      .from(
        `(select * from get_h3_uncompact_geo_region('${georegionId}', 6))`,
        'geoRegion',
      )
      .innerJoin(
        producerH3.h3tableName,
        'producerH3',
        `"producerH3".h3index = "geoRegion".h3index`,
      )
      .innerJoin(
        harvestH3.h3tableName,
        'harvestH3',
        `"harvestH3".h3index = "geoRegion".h3index`,
      )
      .innerJoin(
        bioH3.h3tableName,
        'bioH3',
        '"bioH3".h3index = "geoRegion".h3index',
      )
      .innerJoin(
        carbonH3.h3tableName,
        'carbonH3',
        '"carbonH3".h3index = "geoRegion".h3index',
      )
      .innerJoin(
        deforestH3.h3tableName,
        'deforestH3',
        '"deforestH3".h3index = "geoRegion".h3index',
      )
      .innerJoin(
        waterH3.h3tableName,
        'waterH3',
        '"waterH3".h3index = "geoRegion".h3index',
      );

    const result: any = await queryRunner.query(values.getQuery());
    if (!result.length)
      this.logger.warn(
        `Could not retrieve Sourcing Records with weighted indicator values`,
      );
    return result[0];
  }

  async calculateAllSourcingRecords(): Promise<
    SourcingRecordsWithIndicatorRawDataDto[]
  > {
    const connection: Connection = getConnection();
    const queryRunner: QueryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let result: SourcingRecordsWithIndicatorRawDataDto[] = [];
    try {
      const sourcingRecordsQuery: SelectQueryBuilder<unknown> = connection
        .createQueryBuilder()
        .select([
          `sr.id as "sourcingRecordId",
          sr.tonnage,
          sr.year,
          sl.id as "sourcingLocationId",
          sl."materialId",
          sl."geoRegionId",
          mth."h3DataId" as "materialH3DataId"`,
        ])
        .from('sourcing_records', 'sr')
        .innerJoin('sourcing_location', 'sl', 'sl.id = sr."sourcingLocationId"')
        .innerJoin(
          (subQuery: SelectQueryBuilder<any>) => {
            return subQuery
              .select('"materialId"')
              .addSelect('"h3DataId"')
              .from('material_to_h3', 'material_to_h3')
              .where(`type='${MATERIAL_TO_H3_TYPE.HARVEST}'`);
          },
          'mth',
          'mth."materialId" = sl."materialId"',
        )
        .where('sl."scenarioInterventionId" IS NULL')
        .andWhere('sl."interventionType" IS NULL');

      const sourcingRecords: any[] = await queryRunner.query(
        sourcingRecordsQuery.getQuery(),
      );
      result = await Promise.all(
        sourcingRecords.map(async (sourcingRecord: any) => {
          const rawValues: any = await this.calculateImpact(
            connection,
            queryRunner,
            sourcingRecord.geoRegionId,
            sourcingRecord.materialId,
            sourcingRecord.year,
          );

          return {
            sourcingRecordId: sourcingRecord.sourcingRecordId,
            tonnage: sourcingRecord.tonnage,
            year: sourcingRecord.year,

            sourcingLocationId: sourcingRecord.sourcingLocationId,
            production: rawValues.production,
            harvestedArea: rawValues.harvestedArea,

            rawDeforestation: rawValues.rawDeforestation,
            rawBiodiversity: rawValues.rawBiodiversity,
            rawCarbon: rawValues.rawCarbon,
            rawWater: rawValues.rawWater,

            materialH3DataId: sourcingRecord.materialH3DataId,
          };
        }),
      );

      await queryRunner.commitTransaction();
    } catch (err) {
      // rollback changes before throwing error
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // release query runner which is manually created
      await queryRunner.release();
    }

    if (!result.length) {
      throw new Error('No raw impact data could be calculated');
    }

    return result;
  }

  /**
   * Generates a Map that contains for each Indicator Type the corresponding H3Data (if there's H3Data present for the year 2010 and 2020, and 2013
   * is requested, it will return the H3Data of 2010)
   * NOTE: implemented here to be able to reuse the connection object used in the main calculation SQL query and use the
   * transaction capability
   * @param connection
   * @param queryRunner
   * @param indicatorTypes
   * @param year
   */
  getIndicatorH3sByTypeAndClosestYear(
    connection: Connection,
    queryRunner: QueryRunner,
    indicatorTypes: INDICATOR_TYPES[],
    year: number,
  ): Promise<Map<INDICATOR_TYPES, H3Data>> {
    return indicatorTypes.reduce(
      async (
        previousValue: Promise<Map<INDICATOR_TYPES, H3Data>>,
        currentIndicatorType: INDICATOR_TYPES,
      ) => {
        const queryBuilder: SelectQueryBuilder<H3Data> = connection
          .createQueryBuilder()
          .select(' h3data.*')
          .from(H3Data, 'h3data')
          .leftJoin(
            'indicator',
            'indicator',
            'h3data.indicatorId = indicator.id',
          )
          .where(`indicator.nameCode = '${currentIndicatorType}'`)
          .orderBy(`ABS(h3data.year - ${year})`, 'ASC')
          .limit(1);

        const map: Map<INDICATOR_TYPES, H3Data> = await previousValue;

        try {
          const result: any = await queryRunner.query(queryBuilder.getQuery());

          if (result.length) {
            map.set(currentIndicatorType, result[0]);
          }
        } catch (err) {
          console.error(err);
        }

        return map;
      },
      Promise.resolve(new Map()),
    );
  }

  /**
   * Generates a Map that contains, for the given materialId, the corresponding H3Data for each of the material's
   * MATERIAL_TO_H3_TYPE, closest to the given year (if there's H3Data present for the year 2010 and 2020, and 2013
   * is requested, it will return the H3Data of 2010)
   * NOTE: implemented here to be able to reuse the connection object used in the main calculation SQL query and use the
   * transaction capability
   * @param connection
   * @param queryRunner
   * @param materialId
   * @param year
   */
  getAllMaterialH3sByClosestYear(
    connection: Connection,
    queryRunner: QueryRunner,
    materialId: string,
    year: number,
  ): Promise<Map<MATERIAL_TO_H3_TYPE, H3Data>> {
    return Object.values(MATERIAL_TO_H3_TYPE).reduce(
      async (
        previousValue: Promise<Map<MATERIAL_TO_H3_TYPE, H3Data>>,
        currentMaterialToH3Type: MATERIAL_TO_H3_TYPE,
      ) => {
        const queryBuilder: SelectQueryBuilder<H3Data> = connection
          .createQueryBuilder()
          .select('h3data.*')
          .from(H3Data, 'h3data')
          .leftJoin(
            'material_to_h3',
            'materialsToH3s',
            'materialsToH3s.h3DataId = h3data.id',
          )
          .where(`materialsToH3s.materialId = '${materialId}'`)
          .andWhere(`materialsToH3s.type = '${currentMaterialToH3Type}'`)
          .orderBy(`ABS(h3data.year - ${year})`, 'ASC')
          .limit(1);

        const map: Map<MATERIAL_TO_H3_TYPE, H3Data> = await previousValue;
        try {
          const result: any = await queryRunner.query(queryBuilder.getQuery());

          if (result.length) {
            map.set(currentMaterialToH3Type, result[0]);
          }
        } catch (err) {
          console.error(err);
        }

        return map;
      },
      Promise.resolve(new Map()),
    );
  }
}
