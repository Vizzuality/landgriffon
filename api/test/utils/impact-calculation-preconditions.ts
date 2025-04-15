/**
 * @description Preconditions needed for the time being due to hardcoded Indicator H3 data names
 * in stored procedures. We can avoid this once we improve said functions to retrieve Indicator data
 * dynamically and follow the standard approach
 */

import { createH3Data, createIndicator } from '../entity-mocks';
import { h3IndicatorExampleDataFixture } from '../e2e/h3-data/mocks/h3-fixtures';
import {
  Indicator,
  INDICATOR_NAME_CODES,
} from 'modules/indicators/indicator.entity';
import { DataSource } from 'typeorm';
import { H3Data } from 'modules/h3-data/h3-data.entity';

export const createWorldToCalculateImpactOfAllIndicators = async (
  dataSource: DataSource,
): Promise<{
  indicatorMap: Map<INDICATOR_NAME_CODES, Indicator>;
  h3DataMap: Map<INDICATOR_NAME_CODES, H3Data>;
}> => {
  // Creating Indicators:
  const indicatorMap: Map<INDICATOR_NAME_CODES, Indicator> = new Map();
  const h3DataMap: Map<INDICATOR_NAME_CODES, H3Data> = new Map();
  for (const nameCode of Object.values(INDICATOR_NAME_CODES)) {
    const indicator = await createIndicator({
      name: nameCode,
      nameCode,
    });
    const h3Data = await createH3Data({
      h3columnName: `indicator_${nameCode.toLowerCase()}`,
      h3tableName: `h3_grid_${nameCode.toLowerCase()}`,
      indicatorId: indicator.id,
    });

    indicatorMap.set(nameCode, indicator);
    h3DataMap.set(nameCode, h3Data);
  }

  // Creating tables with h3Data for the new indicators
  for await (const H3Data of h3DataMap.values()) {
    await dataSource.query(
      `CREATE TABLE "${H3Data.h3tableName}" (h3index h3index, "${H3Data.h3columnName}" float4);`,
    );
    let query = `INSERT INTO ${H3Data.h3tableName} (h3index, "${H3Data.h3columnName}") VALUES `;
    const queryArr = [];
    for (const [key, value] of Object.entries(h3IndicatorExampleDataFixture)) {
      queryArr.push(`('${key}', ${value})`);
    }
    query = query.concat(queryArr.join());
    await dataSource.query(query);
  }

  return {
    h3DataMap,
    indicatorMap,
  };
};
