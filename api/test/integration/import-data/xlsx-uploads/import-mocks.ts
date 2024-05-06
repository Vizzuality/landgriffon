import { h3DataMock } from '../../../e2e/h3-data/mocks/h3-data.mock';
import {
  createIndicator,
  createMaterial,
  createMaterialToH3,
} from '../../../entity-mocks';
import { Material } from 'modules/materials/material.entity';
import {
  Indicator,
  INDICATOR_NAME_CODES,
} from 'modules/indicators/indicator.entity';
import { snakeCase } from 'typeorm/util/StringUtils';
import { MATERIAL_TO_H3_TYPE } from 'modules/materials/material-to-h3.entity';
import { range } from 'lodash';
import { h3BasicFixture } from '../../../e2e/h3-data/mocks/h3-fixtures';
import { DataSource } from 'typeorm';
import { generateRandomName } from '../../../utils/generate-random-name';

async function createIndicatorsForXLSXImport(
  dataSource: DataSource,
  customIndicators?: Indicator[],
): Promise<string[]> {
  const indicatorSpec = [
    {
      name: 'Deforestation loss due to land use change',
      nameCode: INDICATOR_NAME_CODES.DF_SLUC,
    },
    {
      name: 'Carbon emissions due to land use change',
      nameCode: INDICATOR_NAME_CODES.GHG_DEF_SLUC,
    },
    {
      name: 'Biodiversity loss due to land use change',
      nameCode: INDICATOR_NAME_CODES.LF,
    },
    {
      name: 'Unsustainable water use',
      nameCode: INDICATOR_NAME_CODES.UWU,
    },
  ];

  const tableList: string[] = [];

  for (const spec of customIndicators ?? indicatorSpec) {
    const indicator: Indicator = await createIndicator({
      name: spec.name,
      nameCode: spec.nameCode,
    });

    for (const year of range(2010, 2020)) {
      await h3DataMock(dataSource, {
        h3TableName: `${generateRandomName()}${spec.name
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
    customMaterials?: any[];
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
      hsCodeId: '0803',
      parentHsCodeId: '08',
    },
    {
      name: 'Coffee, whether or not roasted or decaffeinated; husks and skins; coffee substitutes containing coffee in any proportion',
      hsCodeId: '0901',
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

  for (const spec of args?.customMaterials ?? materialSpec) {
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

export { createMaterialTreeForXLSXImport, createIndicatorsForXLSXImport };
