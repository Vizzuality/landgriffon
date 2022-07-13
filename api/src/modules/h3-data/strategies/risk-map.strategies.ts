import { Indicator, INDICATOR_TYPES } from '../../indicators/indicator.entity';
import { H3Data } from '../h3-data.entity';
import { MATERIAL_TO_H3_TYPE } from '../../materials/material-to-h3.entity';
import { getManager, SelectQueryBuilder } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

/**
 * This File contains a group of helper strategy functions that generate the SQL to calculate the risk maps values for
 * each type of Indicator.
 * This is so because the formula and indicator (and potentially material) H3 Data required for calculation can be
 * different, and the number of potential indicators is finite but potentially incremental. For example the BioDiversity
 * indicator, depends on BioDiversity and Deforestation H3 data.
 *
 * The prepareRiskMapBaseSQL function creates the base SQL statement with the FROM and JOIN clauses for indicators and
 * materials. This will be used by each indicator specific function, after checking for required data in the passed
 * parameters, to add the select clause with the risk value formula
 */

type PrepareIndicatorRiskMapSQL = (
  indicatorH3s: Map<INDICATOR_TYPES, H3Data>,
  materialH3s: Map<MATERIAL_TO_H3_TYPE, H3Data>,
  calculusFactor: number,
) => SelectQueryBuilder<any>;

const baseRiskMapSQLTable: string = 'risk_calc';
const baseRiskMapSQLColumn: string = 'risk';

const indicatorRiskMaps: Record<INDICATOR_TYPES, PrepareIndicatorRiskMapSQL> = {
  [INDICATOR_TYPES.BIODIVERSITY_LOSS]: prepareRiskMapBiodiversitySQL,
  [INDICATOR_TYPES.CARBON_EMISSIONS]: prepareRiskMapCarbonEmissionSQL,
  [INDICATOR_TYPES.DEFORESTATION]: prepareRiskMapDeforestationSQL,
  [INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE]: prepareRiskMapWaterSQL,
};

/**
 * For use on unimplement indicators
 * @param geoRegionId
 * @param indicatorH3s
 * @param materialH3s
 */
function prepareUnsupportedSQL(
  indicatorH3s: Map<INDICATOR_TYPES, H3Data>,
  materialH3s: Map<MATERIAL_TO_H3_TYPE, H3Data>,
  calculusFactor: number,
): SelectQueryBuilder<any> {
  throw new Error('Unsupported Risk Map calculation');
}

function prepareRiskMapBiodiversitySQL(
  indicatorH3s: Map<INDICATOR_TYPES, H3Data>,
  materialH3s: Map<MATERIAL_TO_H3_TYPE, H3Data>,
  calculusFactor: number,
): SelectQueryBuilder<any> {
  const indicatorType: INDICATOR_TYPES = INDICATOR_TYPES.BIODIVERSITY_LOSS;

  //Check dependencies/requirementes in provided data
  checkMissingMaterialH3Data(indicatorType, materialH3s, [
    MATERIAL_TO_H3_TYPE.PRODUCER,
    MATERIAL_TO_H3_TYPE.HARVEST,
  ]);

  checkMissingIndicatorH3Dependencies(
    INDICATOR_TYPES.BIODIVERSITY_LOSS,
    indicatorH3s,
  );

  // Once checked, grab the H3Data references, for readability
  const deforestationIndicatorH3Column: string = indicatorH3s.get(
    INDICATOR_TYPES.DEFORESTATION,
  )!.h3columnName;
  const biodiversityIndicatorH3Column: string = indicatorH3s.get(
    INDICATOR_TYPES.BIODIVERSITY_LOSS,
  )!.h3columnName;

  const materialH3ProducerColumn: string = materialH3s.get(
    MATERIAL_TO_H3_TYPE.PRODUCER,
  )!.h3columnName;
  const materialH3HarvestColumn: string = materialH3s.get(
    MATERIAL_TO_H3_TYPE.HARVEST,
  )!.h3columnName;

  return (
    prepareRiskMapBaseSQL(indicatorType, indicatorH3s, materialH3s)
      //`indicatorh3."${indicatorH3Data.h3columnName}" * (${calculusFactor}/0.0001) * ((deforestationh3."${deforestationH3Data.h3columnName}" * harvesth3."${harvestMaterialH3Data.h3columnName}") / (sum(materialh3."${producerMaterialH3Data.h3columnName}") over())) bio_risk`,
      .addSelect(
        `"${INDICATOR_TYPES.BIODIVERSITY_LOSS}"."${biodiversityIndicatorH3Column}" ` +
          ` * (${calculusFactor}/0.0001) ` +
          ` * ( ("${INDICATOR_TYPES.DEFORESTATION}"."${deforestationIndicatorH3Column}" ` +
          ` * "${MATERIAL_TO_H3_TYPE.HARVEST}"."${materialH3HarvestColumn}") ` +
          ` ) "${baseRiskMapSQLColumn}"`,
      )
  );
}

function prepareRiskMapCarbonEmissionSQL(
  indicatorH3s: Map<INDICATOR_TYPES, H3Data>,
  materialH3s: Map<MATERIAL_TO_H3_TYPE, H3Data>,
  calculusFactor: number,
): SelectQueryBuilder<any> {
  const indicatorType: INDICATOR_TYPES = INDICATOR_TYPES.CARBON_EMISSIONS;

  //Check dependencies/requirementes in provided data
  checkMissingMaterialH3Data(indicatorType, materialH3s, [
    MATERIAL_TO_H3_TYPE.PRODUCER,
    MATERIAL_TO_H3_TYPE.HARVEST,
  ]);

  checkMissingIndicatorH3Dependencies(
    INDICATOR_TYPES.CARBON_EMISSIONS,
    indicatorH3s,
  );

  // Once checked, grab the H3Data references, for readability
  const deforestationIndicatorH3Column: string = indicatorH3s.get(
    INDICATOR_TYPES.DEFORESTATION,
  )!.h3columnName;
  const carbonEmissionIndicatorH3Column: string = indicatorH3s.get(
    INDICATOR_TYPES.CARBON_EMISSIONS,
  )!.h3columnName;

  const materialH3ProducerColumn: string = materialH3s.get(
    MATERIAL_TO_H3_TYPE.PRODUCER,
  )!.h3columnName;
  const materialH3HarvestColumn: string = materialH3s.get(
    MATERIAL_TO_H3_TYPE.HARVEST,
  )!.h3columnName;

  return (
    prepareRiskMapBaseSQL(indicatorType, indicatorH3s, materialH3s)
      //`indicatorh3."${indicatorH3Data.h3columnName}" * ((deforestationh3."${deforestationH3Data.h3columnName}" * harvesth3."${harvestMaterialH3Data.h3columnName}") / sum(materialh3."${producerMaterialH3Data.h3columnName}") over()) carbon_risk`,
      .addSelect(
        `"${INDICATOR_TYPES.CARBON_EMISSIONS}"."${carbonEmissionIndicatorH3Column}" ` +
          ` * ( ("${INDICATOR_TYPES.DEFORESTATION}"."${deforestationIndicatorH3Column}" ` +
          ` * "${MATERIAL_TO_H3_TYPE.HARVEST}"."${materialH3HarvestColumn}") ` +
          ` ) "${baseRiskMapSQLColumn}"`,
      )
  );
}

function prepareRiskMapDeforestationSQL(
  indicatorH3s: Map<INDICATOR_TYPES, H3Data>,
  materialH3s: Map<MATERIAL_TO_H3_TYPE, H3Data>,
  calculusFactor: number,
): SelectQueryBuilder<any> {
  const indicatorType: INDICATOR_TYPES = INDICATOR_TYPES.DEFORESTATION;
  //Check dependencies/requirementes in provided data
  checkMissingMaterialH3Data(indicatorType, materialH3s, [
    MATERIAL_TO_H3_TYPE.PRODUCER,
    MATERIAL_TO_H3_TYPE.HARVEST,
  ]);

  checkMissingIndicatorH3Dependencies(
    INDICATOR_TYPES.DEFORESTATION,
    indicatorH3s,
  );

  // Once checked, grab the H3Data references, for readability
  const deforestationIndicatorH3Column: string = indicatorH3s.get(
    INDICATOR_TYPES.DEFORESTATION,
  )!.h3columnName;

  const materialH3ProducerColumn: string = materialH3s.get(
    MATERIAL_TO_H3_TYPE.PRODUCER,
  )!.h3columnName;
  const materialH3HarvestColumn: string = materialH3s.get(
    MATERIAL_TO_H3_TYPE.HARVEST,
  )!.h3columnName;

  return (
    prepareRiskMapBaseSQL(indicatorType, indicatorH3s, materialH3s)
      //`(indicatorh3."${indicatorH3Data.h3columnName}" * harvesth3."${harvestMaterialH3Data.h3columnName}") / sum(materialh3."${producerMaterialH3Data.h3columnName}") over() def_risk`,
      .addSelect(
        `("${INDICATOR_TYPES.DEFORESTATION}"."${deforestationIndicatorH3Column}"` +
          ` * "${MATERIAL_TO_H3_TYPE.HARVEST}"."${materialH3HarvestColumn}")` +
          ` "${baseRiskMapSQLColumn}"`,
      )
  );
}

function prepareRiskMapWaterSQL(
  indicatorH3s: Map<INDICATOR_TYPES, H3Data>,
  materialH3s: Map<MATERIAL_TO_H3_TYPE, H3Data>,
  calculusFactor: number,
): SelectQueryBuilder<any> {
  const indicatorType: INDICATOR_TYPES =
    INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE;

  // Check dependencies/requirements in provided data
  // For Water Risk, actually only the PRODUCER material is required
  checkMissingMaterialH3Data(indicatorType, materialH3s, [
    MATERIAL_TO_H3_TYPE.PRODUCER,
  ]);

  checkMissingIndicatorH3Dependencies(
    INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE,
    indicatorH3s,
  );

  // Once checked, grab the H3Data references, for readability
  const waterIndicatorH3Column: string = indicatorH3s.get(
    INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE,
  )!.h3columnName;

  const materialH3ProducerColumn: string = materialH3s.get(
    MATERIAL_TO_H3_TYPE.PRODUCER,
  )!.h3columnName;

  return (
    prepareRiskMapBaseSQL(indicatorType, indicatorH3s, materialH3s)
      //`indicatorh3."${indicatorH3Data.h3columnName}" * ${calculusFactor} / sum(materialh3."${materialH3Data.h3columnName}") over() water_risk`,
      .addSelect(
        `"${INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE}"."${waterIndicatorH3Column}" ` +
          ` * ${calculusFactor} ` +
          ` "${baseRiskMapSQLColumn}"`,
      )
  );
}

/**
 * Helper function that constructs and returns a SelectQueryBuilder with the necessary tables/joins
 * of both indicator and material H3s for getting the data for Risk Maps. Meant for use in each
 * indicator-specific risk Map calculation strategy
 * @param mainIndicatorType
 * @param indicatorH3s
 * @param materialH3s
 */
function prepareRiskMapBaseSQL(
  mainIndicatorType: INDICATOR_TYPES,
  indicatorH3s: Map<INDICATOR_TYPES, H3Data>,
  materialH3s: Map<MATERIAL_TO_H3_TYPE, H3Data>,
): SelectQueryBuilder<any> {
  //We'll use the main indicator h3 table as the base for the FROM clause
  const query: SelectQueryBuilder<any> = getManager()
    .createQueryBuilder()
    .select(`"${mainIndicatorType}".h3index`)
    .from(indicatorH3s.get(mainIndicatorType)!.h3tableName, mainIndicatorType)
    .andWhere(
      `"${mainIndicatorType}"."${
        indicatorH3s.get(mainIndicatorType)!.h3columnName
      }" is not null`,
    )
    .andWhere(
      `"${mainIndicatorType}"."${
        indicatorH3s.get(mainIndicatorType)!.h3columnName
      }" <> 0`,
    );

  materialH3s.forEach(
    (materialH3: H3Data, materialType: MATERIAL_TO_H3_TYPE) => {
      query
        .innerJoin(
          materialH3.h3tableName,
          materialType,
          `"${mainIndicatorType}"."h3index" = "${materialType}"."h3index"`,
        )
        .andWhere(`"${materialType}"."${materialH3.h3columnName}" is not null`)
        .andWhere(`"${materialType}"."${materialH3.h3columnName}" <> 0`);
    },
  );

  indicatorH3s.forEach(
    (indicatorH3: H3Data, indicatorType: INDICATOR_TYPES) => {
      // Because the main indicator has already been added to the query
      // as base entity for the FROM clause, ignore it
      if (indicatorType === mainIndicatorType) {
        return;
      }
      query
        .innerJoin(
          indicatorH3.h3tableName,
          indicatorType,
          `"${mainIndicatorType}"."h3index" = "${indicatorType}"."h3index"`,
        )
        .andWhere(
          `"${indicatorType}"."${indicatorH3.h3columnName}" is not null`,
        )
        .andWhere(`"${indicatorType}"."${indicatorH3.h3columnName}" <> 0`);
    },
  );
  return query;
}

function checkMissingMaterialH3Data(
  indicatorType: INDICATOR_TYPES,
  materialH3s: Map<MATERIAL_TO_H3_TYPE, H3Data>,
  requiredMaterialTypes: MATERIAL_TO_H3_TYPE[],
): void {
  for (const requiredMaterialType of requiredMaterialTypes) {
    if (!materialH3s.get(requiredMaterialType)) {
      throw new NotFoundException(
        `H3 Data of Material of type ${requiredMaterialType} missing for ${indicatorType} Risk Map calculations`,
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
          `H3 Data of Indicator dependency of type ${value} missing for ${indicatorType} Risk Map calculation`,
        );
    },
  );
}

const exportObject: any = {
  baseRiskMapSQLTable,
  baseRiskMapSQLColumn,
  strategies: indicatorRiskMaps,
};

export { exportObject as IndicatorRiskMapSQLStrategies };
