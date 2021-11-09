import { createIndicator, createMaterial } from '../../entity-mocks';
import { createFakeH3Data } from '../../h3-data/mocks/create-fake-h3-data';
import { Material } from '../../../src/modules/materials/material.entity';
import { Indicator } from '../../../src/modules/indicators/indicator.entity';

async function createIndicatorsForXLSXImport(): Promise<string[]> {
  const indicatorSpec = [
    {
      name: 'Deforestation loss due to land use change',
      nameCode: 'DF_LUC_T',
    },
    {
      name: 'Carbon emissions due to land use change',
      nameCode: 'GHG_LUC_T',
    },
    {
      name: 'Biodiversity loss due to land use change',
      nameCode: 'BL_LUC_T',
    },
    {
      name: 'Unsustainable water use',
      nameCode: 'UWU_T',
    },
  ];

  const tableList: string[] = [];

  for (const spec of indicatorSpec) {
    const indicator: Indicator = await createIndicator({
      name: spec.name,
    });

    await createFakeH3Data(
      `${spec.name.replace(/[^a-zA-Z]/g, '').substring(0, 10)}IndicatorTable`,
      `${spec.name.replace(/[^a-zA-Z]/g, '').substring(0, 10)}IndicatorColumn`,
      null,
      indicator.id,
    );

    tableList.push(
      `${spec.name.replace(/[^a-zA-Z]/g, '').substring(0, 10)}IndicatorTable`,
    );
  }

  return tableList;
}

async function createMaterialTreeForXLSXImport(): Promise<string[]> {
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
      name:
        'Coffee, whether or not roasted or decaffeinated; husks and skins; coffee substitutes containing coffee in any proportion',
      hsCodeId: '901',
      parentHsCodeId: '09',
    },
    {
      name: 'Maize (corn)',
      hsCodeId: '1005',
      parentHsCodeId: '10',
    },
    {
      name:
        "Dairy produce; birds' eggs; natural honey; edible products of animal origin, not elsewhere specified or included",
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
    const materialHarvestH3Table = await createFakeH3Data(
      `${spec.name.replace(/[^a-zA-Z]/g, '').substring(0, 10)}HarvestTable`,
      `${spec.name.replace(/[^a-zA-Z]/g, '').substring(0, 10)}HarvestColumn`,
    );
    const materialProductionH3Table = await createFakeH3Data(
      `${spec.name.replace(/[^a-zA-Z]/g, '').substring(0, 10)}ProductionTable`,
      `${spec.name.replace(/[^a-zA-Z]/g, '').substring(0, 10)}ProductionColumn`,
    );

    tableList.push(
      `${spec.name.replace(/[^a-zA-Z]/g, '').substring(0, 10)}HarvestTable`,
    );
    tableList.push(
      `${spec.name.replace(/[^a-zA-Z]/g, '').substring(0, 10)}ProductionTable`,
    );

    const material = await createMaterial({
      hsCodeId: spec.hsCodeId,
      parent:
        spec.parentHsCodeId && spec.parentHsCodeId in materialMap
          ? materialMap[spec.parentHsCodeId]
          : null,
      producerId: materialProductionH3Table.id,
      harvestId: materialHarvestH3Table.id,
    });

    materialMap[spec.hsCodeId] = material;
  }

  return tableList;
}

export { createMaterialTreeForXLSXImport, createIndicatorsForXLSXImport };
