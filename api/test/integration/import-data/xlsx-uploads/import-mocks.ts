import { h3DataMock } from '../../../e2e/h3-data/mocks/h3-data.mock';
import {
  createIndicator,
  createMaterial,
  createMaterialToH3,
} from '../../../entity-mocks';
import { Material } from 'modules/materials/material.entity';
import {
  Indicator,
  INDICATOR_TYPES,
} from 'modules/indicators/indicator.entity';
import { snakeCase } from 'typeorm/util/StringUtils';
import { MATERIAL_TO_H3_TYPE } from 'modules/materials/material-to-h3.entity';
import { range } from 'lodash';
import { h3BasicFixture } from '../../../e2e/h3-data/mocks/h3-fixtures';
import { DataSource } from 'typeorm';

async function createIndicatorsForXLSXImport(
  dataSource: DataSource,
): Promise<string[]> {
  const indicatorSpec = [
    {
      name: 'Deforestation loss due to land use change',
      nameCode: INDICATOR_TYPES.DEFORESTATION,
    },
    {
      name: 'Carbon emissions due to land use change',
      nameCode: INDICATOR_TYPES.CARBON_EMISSIONS,
    },
    {
      name: 'Biodiversity loss due to land use change',
      nameCode: INDICATOR_TYPES.BIODIVERSITY_LOSS,
    },
    {
      name: 'Unsustainable water use',
      nameCode: INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE,
    },
  ];

  const tableList: string[] = [];

  for (const spec of indicatorSpec) {
    const indicator: Indicator = await createIndicator({
      name: spec.name,
      nameCode: spec.nameCode,
    });

    for (const year of range(2010, 2020)) {
      await h3DataMock(dataSource, {
        h3TableName: `${spec.name
          .replace(/[^a-zA-Z]/g, '')
          .substring(0, 10)}_indicator_table_${year}`,
        h3ColumnName: `${spec.name
          .replace(/[^a-zA-Z]/g, '')
          .substring(0, 10)}IndicatorColumn`,
        additionalH3Data: h3BasicFixture,
        indicatorId: indicator.id,
        year,
      });

      tableList.push(
        `${spec.name
          .replace(/[^a-zA-Z]/g, '')
          .substring(0, 10)}_indicator_table_${year}`,
      );
    }
  }

  return tableList;
}

async function createMaterialTreeForXLSXImport(
  dataSource: DataSource,
  args?: {
    startYear?: number;
    endYear?: number;
  },
): Promise<string[]> {
  const argsWithDefaults: Record<string, any> = {
    startYear: 2010,
    endYear: 2022,
    ...args,
  };
  const materialSpec = [
    {
      name: 'Fruits, berries and nuts',
      hsCodeId: '08',
      parentHsCodeId: null,
    },
    {
      name: 'Coffee, tea, mate and spices',
      hsCodeId: '09',
      parentHsCodeId: null,
    },
    {
      name: 'Cereals',
      hsCodeId: '10',
      parentHsCodeId: null,
    },
    {
      name: 'Bananas, including plantains; fresh or dried',
      hsCodeId: '803',
      parentHsCodeId: '08',
    },
    {
      name: 'Coffee, whether or not roasted or decaffeinated; husks and skins; coffee substitutes containing coffee in any proportion',
      hsCodeId: '901',
      parentHsCodeId: '09',
    },
    {
      name: 'Maize (corn)',
      hsCodeId: '1005',
      parentHsCodeId: '10',
    },
    {
      name: "Dairy produce; birds' eggs; natural honey; edible products of animal origin, not elsewhere specified or included",
      hsCodeId: '40',
      parentHsCodeId: null,
    },
    {
      name: 'Cotton',
      hsCodeId: '52',
      parentHsCodeId: null,
    },
    {
      name: 'Raw hides and skins (other than furskins) and leather',
      hsCodeId: '41',
      parentHsCodeId: null,
    },
  ];

  const materialMap: Record<string, Material> = {};
  const tableList: string[] = [];

  for (const spec of materialSpec) {
    await h3DataMock(dataSource, {
      h3TableName: `${spec.name
        .replace(/[^a-zA-Z]/g, '')
        .substring(0, 10)}HarvestTable`,
      h3ColumnName: `${spec.name
        .replace(/[^a-zA-Z]/g, '')
        .substring(0, 10)}HarvestColumn`,
      additionalH3Data: h3BasicFixture,
      year: 2020,
    });
    await h3DataMock(dataSource, {
      h3TableName: `${spec.name
        .replace(/[^a-zA-Z]/g, '')
        .substring(0, 10)}ProductionTable`,
      h3ColumnName: `${spec.name
        .replace(/[^a-zA-Z]/g, '')
        .substring(0, 10)}ProductionColumn`,
      additionalH3Data: h3BasicFixture,
      year: 2020,
    });

    tableList.push(
      snakeCase(
        `${spec.name.replace(/[^a-zA-Z]/g, '').substring(0, 10)}HarvestTable`,
      ),
    );
    tableList.push(
      snakeCase(
        `${spec.name
          .replace(/[^a-zA-Z]/g, '')
          .substring(0, 10)}ProductionTable`,
      ),
    );

    const material = await createMaterial({
      name: spec.name,
      hsCodeId: spec.hsCodeId,
      parent:
        spec.parentHsCodeId && spec.parentHsCodeId in materialMap
          ? materialMap[spec.parentHsCodeId]
          : null,
    });

    for (const year of range(
      argsWithDefaults.startYear,
      argsWithDefaults.endYear,
    )) {
      const materialHarvestH3Table = await h3DataMock(dataSource, {
        h3TableName: `${spec.name
          .replace(/[^a-zA-Z]/g, '')
          .substring(0, 10)}HarvestTable_${year}`,
        h3ColumnName: `${spec.name
          .replace(/[^a-zA-Z]/g, '')
          .substring(0, 10)}HarvestColumn`,
        additionalH3Data: h3BasicFixture,
        year,
      });
      const materialProductionH3Table = await h3DataMock(dataSource, {
        h3TableName: `${spec.name
          .replace(/[^a-zA-Z]/g, '')
          .substring(0, 10)}ProductionTable_${year}`,
        h3ColumnName: `${spec.name
          .replace(/[^a-zA-Z]/g, '')
          .substring(0, 10)}ProductionColumn`,
        additionalH3Data: h3BasicFixture,
        year,
      });

      tableList.push(
        snakeCase(
          `${spec.name
            .replace(/[^a-zA-Z]/g, '')
            .substring(0, 10)}HarvestTable_${year}`,
        ),
      );
      tableList.push(
        snakeCase(
          `${spec.name
            .replace(/[^a-zA-Z]/g, '')
            .substring(0, 10)}ProductionTable_${year}`,
        ),
      );

      await createMaterialToH3(
        material.id,
        materialProductionH3Table.id,
        MATERIAL_TO_H3_TYPE.PRODUCER,
      );

      await createMaterialToH3(
        material.id,
        materialHarvestH3Table.id,
        MATERIAL_TO_H3_TYPE.HARVEST,
      );

      materialMap[spec.hsCodeId] = material;
    }
  }

  return tableList;
}

const sourcingDataValidationErrorResponse: Record<string, any>[] = [
  {
    line: 2,
    column: 'material.hsCode',
    errors: {
      minLength: 'material.hsCode must be longer than or equal to 2 characters',
    },
  },
  {
    line: 2,
    column: 'location_country_input',
    errors: {
      isString: 'location_country_input must be a string',
      isNotEmpty: 'Location country input is required',
    },
  },
  {
    line: 2,
    column: 'location_address_input',
    errors: {
      location_address: 'Address must be empty for locations of type unknown',
    },
  },
  {
    line: 2,
    column: 'location_latitude_input',
    errors: {
      latitude: 'Coordinates must be empty for locations of type unknown',
    },
  },
  {
    line: 2,
    column: 'location_longitude_input',
    errors: {
      longitude: 'Coordinates must be empty for locations of type unknown',
    },
  },
  {
    line: 3,
    column: 'business_unit.path',
    errors: {
      isString: 'business_unit.path must be a string',
      isNotEmpty: 'Business Unit path cannot be empty',
    },
  },
  {
    line: 3,
    column: 'location_address_input',
    errors: {
      location_address:
        'Address must be empty for locations of type country of production',
    },
  },
  {
    line: 3,
    column: 'location_latitude_input',
    errors: {
      latitude:
        'Coordinates must be empty for locations of type country of production',
    },
  },
  {
    line: 3,
    column: 'location_longitude_input',
    errors: {
      longitude:
        'Coordinates must be empty for locations of type country of production',
    },
  },
  {
    line: 4,
    column: 'location_latitude_input',
    errors: {
      latitude:
        'Address input or coordinates are required for locations of type aggregation point. Latitude values must be min: -90, max: 90',
    },
  },
  {
    line: 4,
    column: 'location_longitude_input',
    errors: {
      longitude:
        'Address input or coordinates are required for locations of type aggregation point. Longitude values must be min: -180, max: 180',
    },
  },
  {
    line: 6,
    column: 'location_address_input',
    errors: {
      location_address:
        'Address input OR coordinates are required for locations of type aggregation point. Address must be empty if coordinates are provided',
    },
  },
  {
    line: 6,
    column: 'location_latitude_input',
    errors: {
      latitude:
        'Address input OR coordinates must be provided for locations of type aggregation point. Latitude must be empty if address is provided',
    },
  },
  {
    line: 6,
    column: 'location_longitude_input',
    errors: {
      longitude:
        'Address input OR coordinates must be provided for locations of type aggregation point. Latitude must be empty if address is provided',
    },
  },
  {
    line: 7,
    column: 'location_latitude_input',
    errors: {
      latitude:
        'Address input or coordinates are required for locations of type aggregation point. Latitude values must be min: -90, max: 90',
    },
  },
  {
    line: 7,
    column: 'location_longitude_input',
    errors: {
      longitude:
        'Address input or coordinates are required for locations of type aggregation point. Longitude values must be min: -180, max: 180',
    },
  },
  {
    line: 8,
    column: 'location_address_input',
    errors: {
      location_address:
        'Address input or coordinates are required for locations of type point of production.',
    },
  },
  {
    line: 8,
    column: 'location_latitude_input',
    errors: {
      latitude:
        'Address input or coordinates are required for locations of type point of production. Latitude values must be min: -90, max: 90',
    },
  },
  {
    line: 8,
    column: 'location_longitude_input',
    errors: {
      longitude:
        'Address input or coordinates are required for locations of type point of production. Longitude values must be min: -180, max: 180',
    },
  },
  {
    line: 9,
    column: 'location_address_input',
    errors: {
      location_address:
        'Address input OR coordinates are required for locations of type point of production. Address must be empty if coordinates are provided',
    },
  },
  {
    line: 9,
    column: 'location_latitude_input',
    errors: {
      latitude:
        'Address input OR coordinates must be provided for locations of type point of production. Latitude must be empty if address is provided',
    },
  },
  {
    line: 9,
    column: 'location_longitude_input',
    errors: {
      longitude:
        'Address input OR coordinates must be provided for locations of type point of production. Latitude must be empty if address is provided',
    },
  },
  {
    line: 10,
    column: 'location_address_input',
    errors: {
      location_address:
        'Address input OR coordinates are required for locations of type aggregation point. Address must be empty if coordinates are provided',
    },
  },
  {
    line: 10,
    column: 'location_latitude_input',
    errors: {
      latitude:
        'Address input OR coordinates must be provided for locations of type aggregation point. Latitude must be empty if address is provided',
    },
  },
  {
    line: 10,
    column: 'location_longitude_input',
    errors: {
      longitude:
        'Address input OR coordinates must be provided for locations of type aggregation point. Latitude must be empty if address is provided',
    },
  },
];

export {
  createMaterialTreeForXLSXImport,
  createIndicatorsForXLSXImport,
  sourcingDataValidationErrorResponse,
};
