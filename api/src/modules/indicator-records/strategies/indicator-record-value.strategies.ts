import {
  Indicator,
  INDICATOR_TYPES,
} from 'modules/indicators/indicator.entity';
import { H3Data } from 'modules/h3-data/h3-data.entity';
import { MATERIAL_TO_H3_TYPE } from 'modules/materials/material-to-h3.entity';
import { DataSource, SelectQueryBuilder } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

/**
 * This File contains a group of helper strategy functions that generate the SQL to calculate the impact value for
 * an Indicator Record, for each type of Indicator.
 * This is so because the formula and indicator (and potentially material) H3 Data required for calculation can be
 * different, and the number of potential indicators is finite but potentially incremental. For example the BioDiversity
 * indicator, depends on BioDiversity and Deforestation H3 data.
 *
 * The prepareBaseIndicatorRecordValueSQLBody function creates the base SQL statement with the FROM and JOIN clauses
 * for indicators and materials. This will be used by each indicator specific function, after checking for required data
 * in the passed parameters, to add the select clause with the indicator value formula
 */

type PrepareIndicatorRecordValueSQL = (
  dataSource: DataSource,
  geoRegionId: string,
  indicatorH3s: Map<INDICATOR_TYPES, H3Data>,
  materialH3s: Map<MATERIAL_TO_H3_TYPE, H3Data>,
) => SelectQueryBuilder<any>;

/**
 * The strategies are contained on an object with a key->value relationship, defined explicitly for all possible values
 * of INDICATOR_TYPES
 */
const strategies: Record<INDICATOR_TYPES, PrepareIndicatorRecordValueSQL> = {
  [INDICATOR_TYPES.BIODIVERSITY_LOSS]: prepareBioDiversitySQL,
  [INDICATOR_TYPES.CARBON_EMISSIONS]: prepareCarbonSQL,
  [INDICATOR_TYPES.DEFORESTATION]: prepareDeforestationSQL,
  [INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE]: prepareWaterSQL,
};

/**
 * For use on unimplement indicators
 * @param geoRegionId
 * @param indicatorH3s
 * @param materialH3s
 */
function prepareUnsupportedSQL(
  dataSource: DataSource,
  geoRegionId: string,
  indicatorH3s: Map<INDICATOR_TYPES, H3Data>,
  materialH3s: Map<MATERIAL_TO_H3_TYPE, H3Data>,
): SelectQueryBuilder<any> {
  throw new Error('Unsupported Indicator Record calculation');
}

function prepareBioDiversitySQL(
  dataSource: DataSource,
  geoRegionId: string,
  indicatorH3s: Map<INDICATOR_TYPES, H3Data>,
  materialH3s: Map<MATERIAL_TO_H3_TYPE, H3Data>,
): SelectQueryBuilder<any> {
  // Check dependencies/requirements in provided data
  checkMissingMaterialH3Data(INDICATOR_TYPES.BIODIVERSITY_LOSS, materialH3s, [
    MATERIAL_TO_H3_TYPE.HARVEST,
  ]);

  checkMissingIndicatorH3Dependencies(
    INDICATOR_TYPES.BIODIVERSITY_LOSS,
    indicatorH3s,
  );

  // Once checked, grab the H3Data references, for readability
  const deforestationIndicatorColumn: string = indicatorH3s.get(
    INDICATOR_TYPES.DEFORESTATION,
  )!.h3columnName;
  const biodiversityIndicatorColumn: string = indicatorH3s.get(
    INDICATOR_TYPES.BIODIVERSITY_LOSS,
  )!.h3columnName;
  const materialH3Harvest: H3Data = materialH3s.get(
    MATERIAL_TO_H3_TYPE.HARVEST,
  )!;

  return prepareBaseIndicatorRecordValueSQLBody(
    dataSource,
    geoRegionId,
    materialH3Harvest.h3resolution,
    indicatorH3s,
    materialH3s,
  ).addSelect(
    `sum(${MATERIAL_TO_H3_TYPE.HARVEST}."${materialH3Harvest.h3columnName}" ` +
      `* "${INDICATOR_TYPES.DEFORESTATION}"."${deforestationIndicatorColumn}" ` +
      `* "${INDICATOR_TYPES.BIODIVERSITY_LOSS}"."${biodiversityIndicatorColumn}" ` +
      `* (1/0.0001))`,
  );
}

function prepareCarbonSQL(
  dataSource: DataSource,
  geoRegionId: string,
  indicatorH3s: Map<INDICATOR_TYPES, H3Data>,
  materialH3s: Map<MATERIAL_TO_H3_TYPE, H3Data>,
): SelectQueryBuilder<any> {
  // Check dependencies/requirements in provided data
  checkMissingMaterialH3Data(INDICATOR_TYPES.CARBON_EMISSIONS, materialH3s, [
    MATERIAL_TO_H3_TYPE.HARVEST,
  ]);

  checkMissingIndicatorH3Dependencies(
    INDICATOR_TYPES.CARBON_EMISSIONS,
    indicatorH3s,
  );

  // Once checked, grab the H3Data references, for readability
  const deforestationIndicatorColumn: string = indicatorH3s.get(
    INDICATOR_TYPES.DEFORESTATION,
  )!.h3columnName;
  const carbonIndicatorColumn: string = indicatorH3s.get(
    INDICATOR_TYPES.CARBON_EMISSIONS,
  )!.h3columnName;
  const materialH3Harvest: H3Data = materialH3s.get(
    MATERIAL_TO_H3_TYPE.HARVEST,
  )!;

  return prepareBaseIndicatorRecordValueSQLBody(
    dataSource,
    geoRegionId,
    materialH3Harvest.h3resolution,
    indicatorH3s,
    materialH3s,
  ).addSelect(
    `sum(${MATERIAL_TO_H3_TYPE.HARVEST}."${materialH3Harvest.h3columnName}" ` +
      `* "${INDICATOR_TYPES.DEFORESTATION}"."${deforestationIndicatorColumn}" ` +
      `* "${INDICATOR_TYPES.CARBON_EMISSIONS}"."${carbonIndicatorColumn}")`,
  );
}

function prepareDeforestationSQL(
  dataSource: DataSource,
  geoRegionId: string,
  indicatorH3s: Map<INDICATOR_TYPES, H3Data>,
  materialH3s: Map<MATERIAL_TO_H3_TYPE, H3Data>,
): SelectQueryBuilder<any> {
  // Check dependencies/requirements in provided data
  checkMissingMaterialH3Data(INDICATOR_TYPES.DEFORESTATION, materialH3s, [
    MATERIAL_TO_H3_TYPE.HARVEST,
  ]);

  checkMissingIndicatorH3Dependencies(
    INDICATOR_TYPES.DEFORESTATION,
    indicatorH3s,
  );

  // Once checked, grab the H3Data references, for readability
  const deforestationIndicatorColumn: string = indicatorH3s.get(
    INDICATOR_TYPES.DEFORESTATION,
  )!.h3columnName;
  const materialH3Harvest: H3Data = materialH3s.get(
    MATERIAL_TO_H3_TYPE.HARVEST,
  )!;

  return prepareBaseIndicatorRecordValueSQLBody(
    dataSource,
    geoRegionId,
    materialH3Harvest.h3resolution,
    indicatorH3s,
    materialH3s,
  ).addSelect(
    `sum(${MATERIAL_TO_H3_TYPE.HARVEST}."${materialH3Harvest.h3columnName}" * "${INDICATOR_TYPES.DEFORESTATION}"."${deforestationIndicatorColumn}")`,
  );
}

function prepareWaterSQL(
  dataSource: DataSource,
  geoRegionId: string,
  indicatorH3s: Map<INDICATOR_TYPES, H3Data>,
  materialH3s: Map<MATERIAL_TO_H3_TYPE, H3Data>,
): SelectQueryBuilder<any> {
  //Check dependencies/requirements in provided data
  //Water doesn't need materials for the calculation
  checkMissingIndicatorH3Dependencies(
    INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE,
    indicatorH3s,
  );

  // Once checked, grab the H3Data references, for readability
  const waterIndicatorColumn: string = indicatorH3s.get(
    INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE,
  )!.h3columnName;

  return prepareBaseIndicatorRecordValueSQLBody(
    dataSource,
    geoRegionId,
    6, //Hardcoded resolution, since it doesn't use material info
    indicatorH3s,
    materialH3s,
  ).addSelect(
    `sum("${INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE}"."${waterIndicatorColumn}" * 0.0001)`,
  );
}

function prepareBaseIndicatorRecordValueSQLBody(
  dataSource: DataSource,
  geoRegionId: string,
  resolution: number,
  indicatorH3s: Map<INDICATOR_TYPES, H3Data>,
  materialH3s: Map<MATERIAL_TO_H3_TYPE, H3Data>,
): SelectQueryBuilder<any> {
  const query: SelectQueryBuilder<any> = dataSource
    .createQueryBuilder()
    .from(
      `( select * from get_h3_uncompact_geo_region('${geoRegionId}', ${resolution}) )`,
      'geo_region',
    );

  // Add Material JOINs
  // Since the material Type is static and won't change, it will be used as an alias
  materialH3s.forEach((value: H3Data, key: MATERIAL_TO_H3_TYPE) => {
    query.innerJoin(
      value.h3tableName,
      key,
      `geo_region.h3index = ${key}.h3index`,
    );
  });

  // Add indicator JOINs
  // Since the nameCode is static and won't change, it will be used as an alias
  indicatorH3s.forEach((value: H3Data, key: INDICATOR_TYPES) => {
    query.innerJoin(
      value.h3tableName,
      key,
      `geo_region.h3index = "${key}".h3index`,
    );
  });

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
        `H3 Data of Material of type ${requiredMaterialType} missing for ${indicatorType} Indicator Record value calculations`,
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
          `H3 Data of required Indicator of type ${value} missing for ${indicatorType} Indicator Record value calculations`,
        );
    },
  );
}

export { strategies as IndicatorRecordValueSQLStrategies };
