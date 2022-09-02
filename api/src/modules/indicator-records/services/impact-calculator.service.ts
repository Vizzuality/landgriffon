import {
  Connection,
  getConnection,
  QueryRunner,
  SelectQueryBuilder,
} from 'typeorm';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { MATERIAL_TO_H3_TYPE } from 'modules/materials/material-to-h3.entity';
import { H3Data } from 'modules/h3-data/h3-data.entity';
import {
  Indicator,
  INDICATOR_TYPES,
} from 'modules/indicators/indicator.entity';
import { SourcingRecordsWithIndicatorRawDataDto } from 'modules/sourcing-records/dto/sourcing-records-with-indicator-raw-data.dto';

type MaterialSelectStatementGenerator = (
  materialsH3s: Map<MATERIAL_TO_H3_TYPE, H3Data>,
) => string;

type IndicatorSelectStatementGenerator = (
  materialsH3s: Map<MATERIAL_TO_H3_TYPE, H3Data>,
  indicatorH3s: Map<INDICATOR_TYPES, H3Data>,
) => string;

@Injectable()
export class ImpactCalculatorService {
  logger: Logger = new Logger(this.constructor.name);
  private readonly materialSelectStatmenteGenerator: Record<
    MATERIAL_TO_H3_TYPE,
    MaterialSelectStatementGenerator
  > = {
    [MATERIAL_TO_H3_TYPE.HARVEST]: harvestMaterialSelectStatementGenerator,
    [MATERIAL_TO_H3_TYPE.PRODUCER]: producerMaterialSelectStatementGenerator,
  };
  private readonly indicatorSelectStatementGenerator: Record<
    INDICATOR_TYPES,
    IndicatorSelectStatementGenerator
  > = {
    [INDICATOR_TYPES.BIODIVERSITY_LOSS]: bioDiversitySelectStatementGenerator,
    [INDICATOR_TYPES.CARBON_EMISSIONS]: carbonSelectStatementGenerator,
    [INDICATOR_TYPES.DEFORESTATION]: deforestationSelectStatementGenerator,
    [INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE]: waterSelectStatementGenerator,
  };

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
   */

  /**
   * Calculates raw values for all indicators available in the system and all types of material,
   * from all SourcingRecords in the DB that are not part of an intervention.
   * - First, it gets all Sourcing Records, plus related data (its sourcing location, material)
   * - Then for each sourcing record, it gets all the closest H3 Data to its years, and then
   *   calculates the material/indicator raw values in a single DB call
   * @param indicators
   */
  async calculateAllRawValuesForAllSourcingRecords(
    indicators: Indicator[],
  ): Promise<SourcingRecordsWithIndicatorRawDataDto[]> {
    const connection: Connection = getConnection();
    const queryRunner: QueryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    this.logger.log(
      'Calculating All Raw Impact/Material Values for all SourcingRecords',
    );

    let result: SourcingRecordsWithIndicatorRawDataDto[] = [];
    try {
      const sourcingRecords: any[] = await this.getAllSourcingRecordsData(
        connection,
        queryRunner,
      );

      //Generate SourcingRecordsWithIndicatorRawDataDtos from each sourcing record's
      //georegion, material and year, for the given indicators
      result = await Promise.all(
        sourcingRecords.map(async (sourcingRecord: any) => {
          const rawValues: any =
            await this.calculateAllRawValuesForGeoRegionAndYear(
              connection,
              queryRunner,
              indicators,
              sourcingRecord.geoRegionId,
              sourcingRecord.materialId,
              sourcingRecord.year,
              5, // Max resolution
            );

          return this.createResultInstance(
            sourcingRecord,
            rawValues,
            indicators,
          );
        }),
      );

      await queryRunner.commitTransaction();
    } catch (err) {
      // rollback changes before throwing error
      await queryRunner.rollbackTransaction();
      this.logger.error(err);
    } finally {
      // release query runner which is manually created
      await queryRunner.release();
    }

    if (!result.length) {
      throw new Error(
        'No raw data could be calculated could be calculated for all sourcing records',
      );
    }

    return result;
  }

  private async getAllSourcingRecordsData(
    connection: Connection,
    queryRunner: QueryRunner,
  ): Promise<any[]> {
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

    return queryRunner.query(sourcingRecordsQuery.getQuery());
  }

  private createResultInstance(
    sourcingRecord: any,
    rawValues: any,
    indicators: Indicator[],
  ): SourcingRecordsWithIndicatorRawDataDto {
    const indicatorValues: Map<INDICATOR_TYPES, number> = new Map();
    for (const indicator of indicators) {
      const indicatorType: INDICATOR_TYPES =
        indicator.nameCode as INDICATOR_TYPES;

      indicatorValues.set(
        indicatorType,
        rawValues[generateValueAlias(indicatorType)],
      );
    }

    return {
      sourcingRecordId: sourcingRecord.sourcingRecordId,
      tonnage: sourcingRecord.tonnage,
      year: sourcingRecord.year,

      sourcingLocationId: sourcingRecord.sourcingLocationId,
      production: rawValues[generateValueAlias(MATERIAL_TO_H3_TYPE.PRODUCER)],
      harvestedArea: rawValues[generateValueAlias(MATERIAL_TO_H3_TYPE.HARVEST)],

      // TODO remove this hardcoded fields once the "simpleImportCalculations" feature has been tested/approved
      rawDeforestation: rawValues[`DF_LUC_T_value`],
      rawBiodiversity: rawValues[`BL_LUC_T_value`],
      rawCarbon: rawValues[`GHG_LUC_T_value`],
      rawWater: rawValues[`UWU_T_value`],

      indicatorValues,
      materialH3DataId: sourcingRecord.materialH3DataId,
    };
  }

  /**
   * Calculates all raw values for the given geoRegionId and year, with the H3 Datas of
   * indicators and material types closest to the given year
   *  This means raw values for:
   *  - all types of the given MaterialId
   *  - all indicators in the array parameter
   * @param connection
   * @param queryRunner
   * @param georegionId
   * @param materialId
   * @param year
   * @param indicators
   */
  async calculateAllRawValuesForGeoRegionAndYear(
    connection: Connection,
    queryRunner: QueryRunner,
    indicators: Indicator[],
    georegionId: string,
    materialId: string,
    year: number,
    resolution?: number,
  ): Promise<any[]> {
    const materialH3s: Map<MATERIAL_TO_H3_TYPE, H3Data> =
      await this.getAllMaterialH3sByClosestYear(
        connection,
        queryRunner,
        materialId,
        year,
      );
    const indicatorTypes: INDICATOR_TYPES[] = indicators.map(
      (value: Indicator) => value.nameCode as INDICATOR_TYPES,
    );
    const indicatorH3s: Map<INDICATOR_TYPES, H3Data> =
      await this.getIndicatorH3sByTypeAndClosestYear(
        connection,
        queryRunner,
        indicatorTypes,
        year,
      );

    //Use the expanded list of H3 indexes corresponding to the geoRegion id
    //as the base table for the query. Since everything will be joined by h3 indexes,
    // it is assumed that all material/indicator H3 tables have same h3 indexes at the max resolution
    // available (even tho
    const values: SelectQueryBuilder<unknown> = await connection
      .createQueryBuilder()
      .from(
        `(select * from get_h3_uncompact_geo_region('${georegionId}', ${resolution}))`,
        'geoRegion',
      );

    //Material FROM and SELECT statements
    for (const materialType of Object.values(MATERIAL_TO_H3_TYPE)) {
      values.addSelect(
        this.materialSelectStatmenteGenerator[materialType](materialH3s),
        generateValueAlias(materialType),
      );
    }

    for (const [materialType, materialH3Data] of materialH3s) {
      values.innerJoin(
        materialH3Data.h3tableName,
        `${materialType}`,
        `"${materialType}".h3index = "geoRegion".h3index`,
      );
    }

    //Indicator FROM and SELECT statements
    for (const indicatorType of Object.values(INDICATOR_TYPES)) {
      values.addSelect(
        this.indicatorSelectStatementGenerator[indicatorType](
          materialH3s,
          indicatorH3s,
        ),
        generateValueAlias(indicatorType),
      );
    }

    for (const [indicatorType, indicatorH3Data] of indicatorH3s) {
      values.innerJoin(
        indicatorH3Data.h3tableName,
        `${indicatorType}`,
        `"${indicatorType}".h3index = "geoRegion".h3index`,
      );
    }

    try {
      const result: any = await queryRunner.query(values.getQuery());
      if (!result.length)
        this.logger.warn(
          `Could not retrieve any raw values for georegion ${georegionId},year ${year} and material ${materialId}`,
        );
      return result[0];
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
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
  private getIndicatorH3sByTypeAndClosestYear(
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

        const result: any = await queryRunner.query(queryBuilder.getQuery());

        if (result.length) {
          map.set(currentIndicatorType, result[0]);
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
  private getAllMaterialH3sByClosestYear(
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
        const result: any = await queryRunner.query(queryBuilder.getQuery());

        if (result.length) {
          map.set(currentMaterialToH3Type, result[0]);
        }

        return map;
      },
      Promise.resolve(new Map()),
    );
  }
}

/**
 * Small helper function to generate the alias for the select statements
 * @param prefix
 */
function generateValueAlias(
  prefix: MATERIAL_TO_H3_TYPE | INDICATOR_TYPES,
): string {
  return `${prefix}_value`;
}

//// Select Statetement Generators
// These functions generate the SQL statetement with its corresponding formula, for each
// material type and indicator to be supported following the strategy pattern
// The string representation of the material/indicator type enum is used as aliases for the corresponding
// H3 tables
// TODO this part can potentially be refactored, once compared to indicator record value strategies
function producerMaterialSelectStatementGenerator(
  materialH3s: Map<MATERIAL_TO_H3_TYPE, H3Data>,
): string {
  const producerType: MATERIAL_TO_H3_TYPE = MATERIAL_TO_H3_TYPE.PRODUCER;
  const producerColumn: string = materialH3s.get(producerType)!.h3columnName;
  return `sum( "${producerType}"."${producerColumn}" )`;
}

function harvestMaterialSelectStatementGenerator(
  materialH3s: Map<MATERIAL_TO_H3_TYPE, H3Data>,
): string {
  const harvestType: MATERIAL_TO_H3_TYPE = MATERIAL_TO_H3_TYPE.HARVEST;
  const harvestColumn: string = materialH3s.get(harvestType)!.h3columnName;
  return `sum( "${harvestType}"."${harvestColumn}" )`;
}

function bioDiversitySelectStatementGenerator(
  materialH3s: Map<MATERIAL_TO_H3_TYPE, H3Data>,
  indicatorH3s: Map<INDICATOR_TYPES, H3Data>,
): string {
  const deforestType: INDICATOR_TYPES = INDICATOR_TYPES.DEFORESTATION;
  const bioType: INDICATOR_TYPES = INDICATOR_TYPES.BIODIVERSITY_LOSS;
  const harvestType: MATERIAL_TO_H3_TYPE = MATERIAL_TO_H3_TYPE.HARVEST;
  //Check dependencies/requirements in provided data
  checkMissingMaterialH3Data(bioType, materialH3s, [harvestType]);
  checkMissingIndicatorH3Dependencies(bioType, indicatorH3s);

  const harvestColumn: string = materialH3s.get(harvestType)!.h3columnName;
  const deforestColumn: string = indicatorH3s.get(deforestType)!.h3columnName;
  const bioColumn: string = indicatorH3s.get(bioType)!.h3columnName;

  return (
    `sum("${harvestType}"."${harvestColumn}" * "${deforestType}"."${deforestColumn}" ` +
    `* "${bioType}"."${bioColumn}" * (1/0.0001) )`
  );
}

function carbonSelectStatementGenerator(
  materialH3s: Map<MATERIAL_TO_H3_TYPE, H3Data>,
  indicatorH3s: Map<INDICATOR_TYPES, H3Data>,
): string {
  const deforestType: INDICATOR_TYPES = INDICATOR_TYPES.DEFORESTATION;
  const carbonType: INDICATOR_TYPES = INDICATOR_TYPES.CARBON_EMISSIONS;
  const harvestType: MATERIAL_TO_H3_TYPE = MATERIAL_TO_H3_TYPE.HARVEST;

  //Check dependencies/requirements in provided data
  checkMissingMaterialH3Data(carbonType, materialH3s, [harvestType]);
  checkMissingIndicatorH3Dependencies(carbonType, indicatorH3s);

  const harvestColumn: string = materialH3s.get(harvestType)!.h3columnName;
  const deforestColumn: string = indicatorH3s.get(deforestType)!.h3columnName;
  const carbonColumn: string = indicatorH3s.get(carbonType)!.h3columnName;
  return (
    `sum( "${harvestType}"."${harvestColumn}" * "${deforestType}"."${deforestColumn}" ` +
    `* "${carbonType}"."${carbonColumn}" )`
  );
}

function deforestationSelectStatementGenerator(
  materialH3s: Map<MATERIAL_TO_H3_TYPE, H3Data>,
  indicatorH3s: Map<INDICATOR_TYPES, H3Data>,
): string {
  const deforestType: INDICATOR_TYPES = INDICATOR_TYPES.DEFORESTATION;
  const harvestType: MATERIAL_TO_H3_TYPE = MATERIAL_TO_H3_TYPE.HARVEST;

  //Check dependencies/requirements in provided data
  checkMissingMaterialH3Data(deforestType, materialH3s, [harvestType]);
  checkMissingIndicatorH3Dependencies(deforestType, indicatorH3s);

  const harvestColumn: string = materialH3s.get(harvestType)!.h3columnName;
  const deforestColumn: string = indicatorH3s.get(deforestType)!.h3columnName;
  return `sum( "${harvestType}"."${harvestColumn}" * "${deforestType}"."${deforestColumn}" )`;
}

function waterSelectStatementGenerator(
  materialH3s: Map<MATERIAL_TO_H3_TYPE, H3Data>,
  indicatorH3s: Map<INDICATOR_TYPES, H3Data>,
): string {
  const waterType: INDICATOR_TYPES = INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE;

  //Check dependencies/requirements in provided data
  //Water doesn't need materials for the calculation
  checkMissingIndicatorH3Dependencies(waterType, indicatorH3s);

  const waterColumn: string = indicatorH3s.get(waterType)!.h3columnName;
  return `sum( "${waterType}"."${waterColumn}" * 0.001 )`;
}

/**
 * Helper functions that check missing H3Data dependencies for the SQL queries
 */
function checkMissingMaterialH3Data(
  indicatorType: INDICATOR_TYPES,
  materialH3s: Map<MATERIAL_TO_H3_TYPE, H3Data>,
  requiredMaterialTypes: MATERIAL_TO_H3_TYPE[],
): void {
  for (const requiredMaterialType of requiredMaterialTypes) {
    if (!materialH3s.get(requiredMaterialType)) {
      throw new NotFoundException(
        `H3 Data of Material of type ${requiredMaterialType} missing for ${indicatorType} raw value calculations`,
      );
    }
  }
}

function checkMissingIndicatorH3Dependencies(
  indicatorType: INDICATOR_TYPES,
  indicatorH3s: Map<INDICATOR_TYPES, H3Data>,
): void {
  Indicator.getIndicatorCalculationDependencies(indicatorType, true).forEach(
    (value: INDICATOR_TYPES) => {
      if (!indicatorH3s.get(value))
        throw new NotFoundException(
          `H3 Data of required Indicator of type ${value} missing for ${indicatorType} raw value calculations`,
        );
    },
  );
}
