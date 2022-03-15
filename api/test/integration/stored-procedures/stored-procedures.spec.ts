import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'app.module';
import {
  createGeoRegion,
  createMaterial,
  createMaterialToH3,
} from '../../entity-mocks';
import { getManager } from 'typeorm';
import {
  h3IndicatorExampleDataFixture,
  h3MaterialExampleDataFixture,
} from '../../e2e/h3-data/mocks/h3-fixtures';
import { H3DataRepository } from 'modules/h3-data/h3-data.repository';
import {
  dropH3DataMock,
  h3DataMock,
} from '../../e2e/h3-data/mocks/h3-data.mock';
import { H3DataModule } from 'modules/h3-data/h3-data.module';
import { createWorldToCalculateIndicatorRecords } from '../../utils/indicator-records-preconditions';
import { IndicatorsModule } from 'modules/indicators/indicators.module';
import { IndicatorRepository } from 'modules/indicators/indicator.repository';
import { Material } from 'modules/materials/material.entity';
import { MATERIAL_TO_H3_TYPE } from 'modules/materials/material-to-h3.entity';
import { MaterialsToH3sService } from 'modules/materials/materials-to-h3s.service';
import { MaterialRepository } from 'modules/materials/material.repository';
import { MaterialsModule } from 'modules/materials/materials.module';
import { snakeCase } from 'typeorm/util/StringUtils';
import { GeoRegionsModule } from 'modules/geo-regions/geo-regions.module';
import { GeoRegionRepository } from 'modules/geo-regions/geo-region.repository';

describe('Stored Procedures Tests', () => {
  let h3DataRepository: H3DataRepository;
  let geoRegionRepository: GeoRegionRepository;
  let indicatorRepository: IndicatorRepository;
  let materialToH3Service: MaterialsToH3sService;
  let materialRepository: MaterialRepository;
  let indicatorWorld: any;
  const h3MockTableName = snakeCase('h3tableMock');
  const h3MockColumnName = 'h3columnName';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        IndicatorsModule,
        H3DataModule,
        MaterialsModule,
        GeoRegionsModule,
      ],
    }).compile();
    h3DataRepository = moduleFixture.get<H3DataRepository>(H3DataRepository);
    indicatorRepository =
      moduleFixture.get<IndicatorRepository>(IndicatorRepository);
    materialToH3Service = moduleFixture.get<MaterialsToH3sService>(
      MaterialsToH3sService,
    );
    materialRepository =
      moduleFixture.get<MaterialRepository>(MaterialRepository);

    geoRegionRepository =
      moduleFixture.get<GeoRegionRepository>(GeoRegionRepository);
  });

  afterEach(async () => {
    await indicatorRepository.delete({});
    await materialToH3Service.delete({});
    await geoRegionRepository.delete({});
    await materialRepository.delete({});
    await h3DataRepository.delete({});
    if (indicatorWorld?.h3tableNames.length)
      await dropH3DataMock([...indicatorWorld.h3tableNames]);
  });

  test('It should return the h3 table and column name and resolution of a given Material Id and a Type', async () => {
    const materialMockH3 = await h3DataMock({
      h3TableName: h3MockTableName,
      h3ColumnName: h3MockColumnName,
      year: 2020,
    });
    const materialMock: Material = await createMaterial({
      name: 'materialMock',
    });
    await createMaterialToH3(
      materialMock.id,
      materialMockH3.id,
      MATERIAL_TO_H3_TYPE.PRODUCER,
    );

    const h3TableResult = await getManager().query(
      `select get_h3_table_column_for_material('${materialMock.id}', '${MATERIAL_TO_H3_TYPE.PRODUCER}') as "h3TableResult"`,
    );
    expect(h3TableResult[0]).toEqual({
      h3TableResult: `(${snakeCase(materialMockH3.h3tableName)},${
        materialMockH3.h3columnName
      },6)`,
    });
    await dropH3DataMock([h3MockTableName]);
  });
  test('It should return a uncompacted array of h3 index given a GeoRegion Id', async () => {
    const geoRegion = await createGeoRegion({
      h3Compact: [
        '8667737afffffff',
        '8667737a7ffffff',
        '86677378fffffff',
        '866773637ffffff',
        '86677362fffffff',
        '866773607ffffff',
        '861203a4fffffff',
      ],
      h3Flat: [
        '8667737afffffff',
        '8667737a7ffffff',
        '86677378fffffff',
        '866773637ffffff',
        '86677362fffffff',
        '866773607ffffff',
        '861203a4fffffff',
      ],
      h3FlatLength: 7,
    });

    const uncompactedGeoregion = await getManager().query(
      `select get_h3_uncompact_geo_region('${geoRegion.id}', 6) as "h3indexes"`,
    );
    uncompactedGeoregion.forEach(
      (h3indexes: { h3indexes: string }, index: number) => {
        if (geoRegion.h3Compact)
          expect(h3indexes.h3indexes).toEqual(geoRegion.h3Compact[index]);
      },
    );
  });
  test('It should return a SUM of all values over all the grids given a GeoRegion', async () => {
    const mockH3Data = await h3DataMock({
      h3TableName: h3MockTableName,
      h3ColumnName: h3MockColumnName,
      additionalH3Data: h3MaterialExampleDataFixture,
      year: 2020,
    });
    const geoRegion = await createGeoRegion({
      h3Compact: Object.keys(h3MaterialExampleDataFixture),
      h3Flat: Object.keys(h3MaterialExampleDataFixture),
      h3FlatLength: Object.keys(h3MaterialExampleDataFixture).length,
    });

    const sumOfAllGrids = await getManager().query(
      `select sum_h3_grid_over_georegion('${geoRegion.id}', 6, '${snakeCase(
        mockH3Data.h3tableName,
      )}', '${mockH3Data.h3columnName}') as "sum"`,
    );

    expect(sumOfAllGrids[0].sum).toEqual(
      Object.values(h3MaterialExampleDataFixture).reduce(
        (acc: any, cur: any) => acc + cur,
        0,
      ),
    );
    await dropH3DataMock([h3MockTableName]);
  });

  test('It should return the SUM of the weighted water applying a calculation factor given a GeoRegion', async () => {
    const expectedResultForGivenGrids = 0.8054600000604988;
    indicatorWorld = await createWorldToCalculateIndicatorRecords();
    const geoRegion = await createGeoRegion({
      h3Compact: Object.keys(h3IndicatorExampleDataFixture),
      h3Flat: Object.keys(h3IndicatorExampleDataFixture),
      h3FlatLength: Object.keys(h3IndicatorExampleDataFixture).length,
    });

    const weightedWaterSum = await getManager().query(
      `select sum_weighted_water_over_georegion('${geoRegion.id}') as sum`,
    );

    expect(weightedWaterSum[0].sum).toEqual(expectedResultForGivenGrids);
  });

  test('It should return the SUM of weighted carbon for harvested Materials given a GeoRegion', async () => {
    const expectedResultForConvergingMaterialAnd2IndicatorH3values = 39500000;
    indicatorWorld = await createWorldToCalculateIndicatorRecords();
    const geoRegion = await createGeoRegion({
      h3Compact: Object.keys(h3IndicatorExampleDataFixture),
      h3Flat: Object.keys(h3IndicatorExampleDataFixture),
      h3FlatLength: Object.keys(h3IndicatorExampleDataFixture).length,
    });
    await Promise.all([]);
    const materialMockH3 = await h3DataMock({
      h3TableName: h3MockTableName,
      h3ColumnName: h3MockColumnName,
      additionalH3Data: h3IndicatorExampleDataFixture,
      year: 2020,
    });
    const materialMock: Material = await createMaterial({
      name: 'materialMock',
    });
    await createMaterialToH3(
      materialMock.id,
      materialMockH3.id,
      MATERIAL_TO_H3_TYPE.HARVEST,
    );

    const sumOfWeightedCarbon = await getManager().query(
      `select sum_weighted_carbon_over_georegion('${geoRegion.id}', '${materialMock.id}', '${MATERIAL_TO_H3_TYPE.HARVEST}') as sum `,
    );

    expect(sumOfWeightedCarbon[0].sum).toEqual(
      expectedResultForConvergingMaterialAnd2IndicatorH3values,
    );
    await dropH3DataMock([h3MockTableName]);
  });

  test('It should return the SUM of weighted biodiversity loss for harvested materials after applying a calculus factor given a GeoRegion', async () => {
    const expectedResultsMultiplyingByMaterial2IndicatorsAndCalculusFacotr = 395000011157.11926;
    indicatorWorld = await createWorldToCalculateIndicatorRecords();
    const geoRegion = await createGeoRegion({
      h3Compact: Object.keys(h3IndicatorExampleDataFixture),
      h3Flat: Object.keys(h3IndicatorExampleDataFixture),
      h3FlatLength: Object.keys(h3IndicatorExampleDataFixture).length,
    });
    const materialMockH3 = await h3DataMock({
      h3TableName: h3MockTableName,
      h3ColumnName: h3MockColumnName,
      additionalH3Data: h3IndicatorExampleDataFixture,
      year: 2020,
    });
    const materialMock: Material = await createMaterial({
      name: 'materialMock',
    });
    await createMaterialToH3(
      materialMock.id,
      materialMockH3.id,
      MATERIAL_TO_H3_TYPE.HARVEST,
    );

    const sumOfWeightedBiodiversituy = await getManager().query(
      `select sum_weighted_biodiversity_over_georegion('${geoRegion.id}', '${materialMock.id}', '${MATERIAL_TO_H3_TYPE.HARVEST}') as sum `,
    );
    expect(sumOfWeightedBiodiversituy[0].sum).toEqual(
      expectedResultsMultiplyingByMaterial2IndicatorsAndCalculusFacotr,
    );
    await dropH3DataMock([h3MockTableName]);
  });
});
