/**
 * @description Preconditions needed for the time being due to hardcoded Indicator H3 data names
 * in stored procedures. We can avoid this once we improve said functions to retrieve Indicator data
 * dynamically and follow the standard approach
 */

import { createH3Data, createIndicator } from '../entity-mocks';
import { getManager } from 'typeorm';
import { h3IndicatorExampleDataFixture } from '../e2e/h3-data/mocks/h3-fixtures';
import { INDICATOR_TYPES } from '../../src/modules/indicators/indicator.entity';

export const createWorldToCalculateIndicatorRecords =
  async (): Promise<any> => {
    const defoIndicator = await createIndicator({
      name: '1',
      nameCode: INDICATOR_TYPES.DEFORESTATION,
    });
    const waterIndicator = await createIndicator({
      name: '2',
      nameCode: INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE,
    });
    const carbonEmissions = await createIndicator({
      name: '3',
      nameCode: INDICATOR_TYPES.CARBON_EMISSIONS,
    });
    const biodiversityLoss = await createIndicator({
      name: '4',
      nameCode: INDICATOR_TYPES.BIODIVERSITY_LOSS,
    });

    const deforestationH3Data = await createH3Data({
      h3tableName: 'h3_grid_deforestation_global',
      h3columnName: 'hansenLoss2019',
      year: 2000,
      indicatorId: defoIndicator.id,
    });
    const biodiversityLossH3Data = await createH3Data({
      h3tableName: 'h3_grid_bio_global',
      h3columnName: 'lciaPslRPermanentCrops',
      year: 2000,
      indicatorId: biodiversityLoss.id,
    });
    const carbonEmissionsH3Data = await createH3Data({
      h3tableName: 'h3_grid_carbon_global',
      h3columnName: 'earthstat2000GlobalHectareEmissions',
      year: 2000,
      indicatorId: carbonEmissions.id,
    });
    const waterRiskH3Data = await createH3Data({
      h3tableName: 'h3_grid_wf_global',
      h3columnName: 'wfBltotMmyrT',
      year: 2000,
      indicatorId: waterIndicator.id,
    });

    for await (const indicatorH3 of [
      deforestationH3Data,
      biodiversityLossH3Data,
      carbonEmissionsH3Data,
      waterRiskH3Data,
    ]) {
      await getManager().query(
        `CREATE TABLE "${indicatorH3.h3tableName}" (h3index h3index, "${indicatorH3.h3columnName}" float4);`,
      );
      let query = `INSERT INTO ${indicatorH3.h3tableName} (h3index, "${indicatorH3.h3columnName}") VALUES `;
      const queryArr = [];
      for (const [key, value] of Object.entries(
        h3IndicatorExampleDataFixture,
      )) {
        queryArr.push(`('${key}', ${value})`);
      }
      query = query.concat(queryArr.join());
      await getManager().query(query);
    }

    return {
      deforestation: deforestationH3Data,
      waterRisk: waterRiskH3Data,
      biodiversityLoss: biodiversityLossH3Data,
      carbonEmissions: carbonEmissionsH3Data,
      h3tableNames: [
        deforestationH3Data.h3tableName,
        waterRiskH3Data.h3tableName,
        biodiversityLossH3Data.h3tableName,
        carbonEmissionsH3Data.h3tableName,
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
