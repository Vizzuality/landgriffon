/**
 * @description Preconditions needed for the time being due to hardcoded Indicator H3 data names
 * in stored procedures. We can avoid this once we improve said functions to retrieve Indicator data
 * dynamically and follow the standard approach
 */

import { createH3Data, createIndicator } from '../entity-mocks';
import { h3IndicatorExampleDataFixture } from '../e2e/h3-data/mocks/h3-fixtures';
import {
  Indicator,
  INDICATOR_TYPES,
} from 'modules/indicators/indicator.entity';
import { DataSource } from 'typeorm';

export const createWorldToCalculateIndicatorRecords = async (
  dataSource: DataSource,
): Promise<any> => {
  // Creating Indicators:
  const climateRisk: Indicator = await createIndicator({
    name: 'climate risk',
    nameCode: INDICATOR_TYPES.CLIMATE_RISK,
  });
  const waterUse: Indicator = await createIndicator({
    name: 'water use',
    nameCode: INDICATOR_TYPES.WATER_USE,
  });
  const unsustainableWaterUse: Indicator = await createIndicator({
    name: 'unsust water use',
    nameCode: INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE,
  });
  const deforestation: Indicator = await createIndicator({
    name: 'def risk',
    nameCode: INDICATOR_TYPES.DEFORESTATION_RISK,
  });

  const landUse: Indicator = await createIndicator({
    name: 'land use',
    nameCode: INDICATOR_TYPES.LAND_USE,
  });

  // Creating tables with h3Data for the new indicators

  const croplandAreaH3Data = await createH3Data({
    h3columnName: 'spam2010V2R0GlobalHAllA',
    h3tableName: 'h3_grid_spam2010v2r0_global_ha',
  });
  const weightedCarbonH3Data = await createH3Data({
    h3columnName: 'forestGhg2020Buffered',
    h3tableName: 'h3_grid_ghg_global',
  });
  const weightedDeforestationH3Data = await createH3Data({
    h3columnName: 'hansenLoss2020HaBuffered',
    h3tableName: 'h3_grid_deforestation_global',
  });
  const waterStressH3Data = await createH3Data({
    h3columnName: 'bwsCat',
    h3tableName: 'h3_grid_aqueduct_global',
  });

  for await (const H3Data of [
    croplandAreaH3Data,
    weightedCarbonH3Data,
    weightedDeforestationH3Data,
    waterStressH3Data,
  ]) {
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
    croplandArea: croplandAreaH3Data,
    weightedCarbon: weightedCarbonH3Data,
    weightedDeforestation: weightedDeforestationH3Data,
    waterStress: waterStressH3Data,
    h3tableNames: [
      croplandAreaH3Data.h3tableName,
      weightedCarbonH3Data.h3tableName,
      weightedDeforestationH3Data.h3tableName,
      waterStressH3Data.h3tableName,
    ],
    indicators: [
      climateRisk,
      waterUse,
      unsustainableWaterUse,
      deforestation,
      landUse,
    ],
  };
};

export const FourMockIndicatorRecords = [
  {
    value: 600,
    indicatorId: '8f7f5bab-46fb-40e2-9031-99c06d155289',
  },
  {
    value: 600,
    indicatorId: 'e0f788eb-aaba-4a23-85f3-936ef672a723',
  },
  {
    value: 600,
    indicatorId: '04ac7860-75a2-4ad6-9dff-25205f5ce0ac',
  },
  {
    value: 550,
    indicatorId: 'ce4780ad-fe11-48eb-9d98-3b14dc33f7be',
  },
];
