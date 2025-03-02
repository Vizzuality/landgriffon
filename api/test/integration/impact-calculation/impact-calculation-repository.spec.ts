import { DataSource } from 'typeorm';
import { ImpactCalculationRepository } from '../../../src/modules/impact/calculation/impact-calculation.repository';
import { Test } from '@nestjs/testing';
import {
  createGeoRegion,
  createH3Data,
  createIndicator,
  createMaterial,
  createMaterialToH3,
} from '../../entity-mocks';
import {
  GeoRegionId,
  MaterialId,
} from '../../../src/modules/impact/calculation/queries/production-and-harvest.query';
import { ImpactCalculationModule } from '../../../src/modules/impact/calculation/impact-calculation.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from '../../../src/typeorm.config';
import { TestingModule } from '@nestjs/testing/testing-module';
import {
  clearEntityTables,
  clearTestDataFromDatabase,
} from '../../utils/database-test-helper';
import {
  MATERIAL_TO_H3_TYPE,
  MaterialToH3,
} from '../../../src/modules/materials/material-to-h3.entity';
import {
  Indicator,
  INDICATOR_NAME_CODES,
} from '../../../src/modules/indicators/indicator.entity';
import { H3Data } from '../../../src/modules/h3-data/h3-data.entity';
import { NotImplementedException } from '@nestjs/common';

describe('ImpactCalculationRepository', () => {
  let testApplication: TestingModule;
  let dataSource: DataSource;
  let impactCalculationRepository: ImpactCalculationRepository;

  beforeAll(async () => {
    testApplication = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(typeOrmConfig), ImpactCalculationModule],
    }).compile();

    dataSource = testApplication.get<DataSource>(DataSource);
    impactCalculationRepository =
      testApplication.get<ImpactCalculationRepository>(
        ImpactCalculationRepository,
      );
  });
  afterEach(async () => {
    await clearEntityTables(dataSource, [MaterialToH3, H3Data, Indicator]);
  });

  afterAll(async () => {
    await clearTestDataFromDatabase(dataSource);
    await testApplication.close();
  });

  test('should return a list of h3 indexes of a georegion', async () => {
    const geoRegion = await createGeoRegion({ name: 'geo1' });

    const geoh3indexList =
      await impactCalculationRepository.getGeoRegionH3IndexList({
        geoRegionId: { value: geoRegion.id } as GeoRegionId,
      });

    expect(geoh3indexList.value).toEqual(geoRegion.h3Compact);
  });

  test('should return the h3 data source of a material given its id and type', async () => {
    const material = await createMaterial({ name: 'material1' });
    const h3DatSource = await createH3Data({
      h3columnName: 'material',
      h3tableName: 'material',
    });
    await createMaterialToH3(
      material.id,
      h3DatSource.id,
      MATERIAL_TO_H3_TYPE.PRODUCER,
    );
    const materialH3DataSource =
      await impactCalculationRepository.getMaterialH3DataSource(
        { value: material.id } as MaterialId,
        MATERIAL_TO_H3_TYPE.PRODUCER,
      );

    expect(materialH3DataSource).toEqual({
      tablename: h3DatSource.h3tableName,
      columnname: h3DatSource.h3columnName,
    });
  });
  test('should return the h3 data source of an indicator given its name code', async () => {
    const indicator = await createIndicator({
      nameCode: INDICATOR_NAME_CODES.NL,
    });
    const h3DatSource = await createH3Data({
      h3columnName: 'indicator',
      h3tableName: 'indicator',
      indicatorId: indicator.id,
    });

    const indicatorH3DataSource =
      await impactCalculationRepository.getIndicatorH3DataSource(
        indicator.nameCode,
      );

    expect(indicatorH3DataSource).toEqual({
      tablename: h3DatSource.h3tableName,
      columnname: h3DatSource.h3columnName,
    });
  });

  // TODO: create entity mocks for MaterialIndicatorToH3 and test
  test.skip('should return material to indicator h3 data source given their ids', async () => {
    throw new NotImplementedException('Test not implemented');
  });
});
