import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { H3DataRepository } from 'modules/h3-data/h3-data.repository';
import { H3DataModule } from 'modules/h3-data/h3-data.module';
import {
  h3DataMock,
  createRandomNamesForH3TableAndColumns,
  dropH3DataMock,
  createRandomIndicatorNameCode,
} from './mocks/h3-data.mock';
import { MaterialRepository } from 'modules/materials/material.repository';
import {
  createH3Data,
  createIndicator,
  createMaterial,
  createMaterialToH3,
  createSourcingLocation,
  createSourcingRecord,
} from '../../entity-mocks';
import { H3Data } from 'modules/h3-data/h3-data.entity';
import {
  Indicator,
  INDICATOR_TYPES,
} from 'modules/indicators/indicator.entity';
import { MATERIAL_TO_H3_TYPE } from 'modules/materials/material-to-h3.entity';
import { MaterialsToH3sService } from 'modules/materials/materials-to-h3s.service';
import { h3BasicFixture } from './mocks/h3-fixtures';
import { saveUserAndGetToken } from '../../utils/userAuth';
import { getApp } from '../../utils/getApp';
import { Material } from 'modules/materials/material.entity';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';

/**
 * Tests for the H3DataModule.
 */

describe('H3-Data Module (e2e) - Get H3 data', () => {
  let app: INestApplication;
  let h3DataRepository: H3DataRepository;
  let materialRepository: MaterialRepository;
  let materialToH3Service: MaterialsToH3sService;
  const fakeTable = 'faketable';
  const fakeColumn = 'fakecolumn';
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, H3DataModule],
    }).compile();

    h3DataRepository = moduleFixture.get<H3DataRepository>(H3DataRepository);
    materialToH3Service = moduleFixture.get<MaterialsToH3sService>(
      MaterialsToH3sService,
    );
    materialRepository =
      moduleFixture.get<MaterialRepository>(MaterialRepository);

    app = getApp(moduleFixture);
    await app.init();
    jwtToken = await saveUserAndGetToken(moduleFixture, app);
  });

  afterEach(async () => {
    await materialToH3Service.delete({});
    await materialRepository.delete({});
    await h3DataRepository.delete({});
    await dropH3DataMock([fakeTable]);
  });

  afterAll(async () => {
    await app.close();
  });

  test('Given the H3 Data table is empty, when I query the API, then I should be acknowledged that no requested H3 Data has been found ', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/h3/data/${fakeTable}/${fakeColumn}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(HttpStatus.NOT_FOUND);

    expect(response.body.errors[0].title).toEqual(
      `H3 ${fakeColumn} data in ${fakeTable} could not been found`,
    );
  });

  test('Given the H3 Data table is populated, when I query the API, then I should get its data in with h3index as key, and column values as value', async () => {
    await h3DataMock({
      h3TableName: fakeTable,
      h3ColumnName: fakeColumn,
      additionalH3Data: h3BasicFixture,
      year: 2020,
    });

    const response = await request(app.getHttpServer())
      .get(`/api/v1/h3/data/${fakeTable}/${fakeColumn}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(HttpStatus.OK);

    expect(response.body.data).toEqual({ h: '861203a4fffffff', v: 1000 });
  });

  test('Given sourcing records exist in DB, When I query available years for a Impact layer, then I should get said data in a array of numbers', async () => {
    const years = [2001, 2001, 2002, 2003, 2007];
    for await (const year of years) {
      await createSourcingRecord({ year });
    }

    const response = await request(app.getHttpServer())
      .get('/api/v1/h3/years')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({ layer: 'impact' })
      .expect(HttpStatus.OK);

    expect(response.body.data).toEqual([...new Set(years)]);
  });

  test('Given sourcing records exist in DB, When I query available years for a Impact layer filtering by one material, then I should get said data in a array of numbers', async () => {
    const fakeH3 = await createH3Data();
    const materialOne = await createMaterial();
    const materialTwo = await createMaterial();

    await createMaterialToH3(
      materialOne.id,
      fakeH3.id,
      MATERIAL_TO_H3_TYPE.PRODUCER,
    );
    await createMaterialToH3(
      materialTwo.id,
      fakeH3.id,
      MATERIAL_TO_H3_TYPE.PRODUCER,
    );
    const sourcingLocation = await createSourcingLocation({
      materialId: materialOne.id,
    });
    const sourcingLocation2 = await createSourcingLocation({
      materialId: materialTwo.id,
    });

    const years = [2001, 2001, 2002, 2003, 2007];
    for await (const year of years) {
      await createSourcingRecord({
        year,
        sourcingLocationId: sourcingLocation.id,
      });
    }
    const years2 = [2010, 2011, 2012];
    for await (const year of years2) {
      await createSourcingRecord({
        year,
        sourcingLocationId: sourcingLocation2.id,
      });
    }

    const response = await request(app.getHttpServer())
      .get(`/api/v1/h3/years?layer=impact&materialIds[]=${materialOne.id}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(HttpStatus.OK);

    expect(response.body.data).toEqual([...new Set(years)]);
  });

  test('Given sourcing records exist in DB, When I query available years for a Impact layer filtering by materials, then I should get said data in a array of numbers', async () => {
    const fakeH3 = await createH3Data();
    const materialOne = await createMaterial();
    const materialTwo = await createMaterial();

    await createMaterialToH3(
      materialOne.id,
      fakeH3.id,
      MATERIAL_TO_H3_TYPE.PRODUCER,
    );
    await createMaterialToH3(
      materialTwo.id,
      fakeH3.id,
      MATERIAL_TO_H3_TYPE.PRODUCER,
    );

    const sourcingLocation = await createSourcingLocation({
      materialId: materialOne.id,
    });
    const sourcingLocation2 = await createSourcingLocation({
      materialId: materialTwo.id,
    });

    const years = [2001, 2001, 2002, 2003, 2007];
    for await (const year of years) {
      await createSourcingRecord({
        year,
        sourcingLocationId: sourcingLocation.id,
      });
    }
    const years2 = [2010, 2011, 2012, 2010, 2011];
    for await (const year of years2) {
      await createSourcingRecord({
        year,
        sourcingLocationId: sourcingLocation2.id,
      });
    }

    const response = await request(app.getHttpServer())
      .get('/api/v1/h3/years')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({ layer: 'impact', materialIds: [materialOne.id, materialTwo.id] })
      .expect(HttpStatus.OK);

    expect(response.body.data).toEqual([...new Set([...years, ...years2])]);
  });

  test(' When I query available years for a Material layer filtering by more than one Material, then I should get a proper error message', async () => {
    const material = await createMaterial();

    const response = await request(app.getHttpServer())
      .get('/api/v1/h3/years')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({ layer: 'material', materialIds: [material.id, material.id] })
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body.errors[0].title).toEqual(
      'Only one Material ID can be requested to filter for available years for a Material Layer type',
    );
  });

  test('Given there is material H3 data, When I query available years for a Material layer, then I should get all available years that are not indicator type', async () => {
    const years = [2001, 2001, 2002, 2003, 2007];
    const fakeH3MasterData: Array<Partial<H3Data>> = [];
    for await (const year of years) {
      fakeH3MasterData.push({
        h3tableName: createRandomNamesForH3TableAndColumns(),
        h3columnName: createRandomNamesForH3TableAndColumns(),
        h3resolution: 6,
        year,
      });
      await h3DataRepository.save(fakeH3MasterData);
    }
    const response = await request(app.getHttpServer())
      .get('/api/v1/h3/years')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({ layer: 'material' })
      .expect(HttpStatus.OK);
    expect(response.body.data).toEqual([...new Set(years)]);
  });

  test('Given there is material H3 data, when I query available years providing a material id, then I should get all available years for that material', async () => {
    const yearsOne = [2001, 2001, 2003, 2018];
    const yearsTwo = [2002, 2002, 2003, 2007];

    const materialOne = await createMaterial();
    const materialTwo = await createMaterial();

    for await (const year of yearsOne) {
      const h3Data: H3Data = await h3DataMock({
        h3TableName: createRandomNamesForH3TableAndColumns(),
        h3ColumnName: createRandomNamesForH3TableAndColumns(),
        additionalH3Data: h3BasicFixture,
        year,
      });

      await createMaterialToH3(
        materialOne.id,
        h3Data.id,
        MATERIAL_TO_H3_TYPE.HARVEST,
      );
    }

    for await (const year of yearsTwo) {
      const h3Data: H3Data = await h3DataMock({
        h3TableName: createRandomNamesForH3TableAndColumns(),
        h3ColumnName: createRandomNamesForH3TableAndColumns(),
        additionalH3Data: h3BasicFixture,
        year,
      });

      await createMaterialToH3(
        materialTwo.id,
        h3Data.id,
        MATERIAL_TO_H3_TYPE.HARVEST,
      );
    }

    const responseOne = await request(app.getHttpServer())
      .get(`/api/v1/h3/years?layer=material&materialIds[]=${materialOne.id}`)
      .set('Authorization', `Bearer ${jwtToken}`);
    expect(responseOne.body.data).toEqual([...new Set(yearsOne)]);

    const responseTwo = await request(app.getHttpServer())
      .get(`/api/v1/h3/years?layer=material&materialIds[]=${materialTwo.id}`)
      .set('Authorization', `Bearer ${jwtToken}`);
    expect(responseTwo.body.data).toEqual([...new Set(yearsTwo)]);
  });

  test('Given there is Indicator H3 data, When I query the API for Risk layer, then I should get all available years that are indicator type', async () => {
    const years = [2001, 2001, 2002, 2003, 2007];
    const fakeH3MasterData: Array<Partial<H3Data>> = [];
    for await (const year of years) {
      const { id } = await createIndicator({
        nameCode: createRandomIndicatorNameCode(),
        name: createRandomNamesForH3TableAndColumns(),
      });
      fakeH3MasterData.push({
        h3tableName: createRandomNamesForH3TableAndColumns(),
        h3columnName: createRandomNamesForH3TableAndColumns(),
        h3resolution: 6,
        year,
        indicatorId: id,
      });
    }
    await h3DataRepository.save(fakeH3MasterData);
    const response = await request(app.getHttpServer())
      .get('/api/v1/h3/years')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({ layer: 'risk' })
      .expect(HttpStatus.OK);

    expect(response.body.data).toEqual([2001, 2002, 2003, 2007]);
  });
  test('Given there is material H3 data, When I query available years providing a indicator id, then I should get all available years for that indicator', async () => {
    const years = [2001, 2001, 2002, 2003, 2007];
    const savedIndicator: Indicator = await createIndicator({
      nameCode: 'GAMMA_RADIATION',
    });
    const fakeH3MasterData: Array<Partial<H3Data>> = [];
    for await (const year of years) {
      fakeH3MasterData.push({
        h3tableName: createRandomNamesForH3TableAndColumns(),
        h3columnName: createRandomNamesForH3TableAndColumns(),
        h3resolution: 6,
        year,
        indicatorId: savedIndicator.id,
      });
    }
    await h3DataRepository.save(fakeH3MasterData);
    const response = await request(app.getHttpServer())
      .get('/api/v1/h3/years')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({ layer: 'risk', indicatorId: savedIndicator.id })
      .expect(HttpStatus.OK);

    expect(response.body.data).toEqual([2001, 2002, 2003, 2007]);
  });
  test('When I query the API for available years with a non-valid layer type, then I should get a proper error message', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/h3/years')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({ layer: 'thisIsCertainlyNotAValidLayerType' })
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body.errors[0].meta.rawError.response.message).toEqual([
      'Available layers types: impact, risk, material',
    ]);
  });
  test('When I query the API for available years by a Material and a Impact layer, then I should receive available years for the child Materials too', async () => {
    // Material that is not part of any Sourcing Location
    const parentMaterial: Material = await createMaterial({
      name: 'parent material',
    });
    // Child Material that is present in Sourcing Locations
    const childMaterial1: Material = await createMaterial({
      name: 'childMaterial',
      parent: parentMaterial,
    });
    // Child Material that is present in Sourcing Locations
    const childMaterial2: Material = await createMaterial({
      name: 'grandChildMaterial',
      parent: parentMaterial,
    });
    // Record for childMaterial1
    const sourcingRecord1: SourcingRecord = await createSourcingRecord({
      year: 2010,
    });
    // Record for childMaterial2
    const sourcingRecord2: SourcingRecord = await createSourcingRecord({
      year: 2020,
    });
    await createSourcingLocation({
      material: childMaterial1,
      sourcingRecords: [sourcingRecord1],
    });
    await createSourcingLocation({
      material: childMaterial2,
      sourcingRecords: [sourcingRecord2],
    });

    const response = await request(app.getHttpServer())
      .get('/api/v1/h3/years')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({ layer: 'impact', 'materialIds[]': [childMaterial1.id] });

    expect(response.body.data).toEqual([2010]);

    const response2 = await request(app.getHttpServer())
      .get('/api/v1/h3/years')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({ layer: 'impact', 'materialIds[]': [childMaterial2.id] });

    expect(response2.body.data).toEqual([2020]);

    const response3 = await request(app.getHttpServer())
      .get('/api/v1/h3/years')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({ layer: 'impact', 'materialIds[]': [parentMaterial.id] });

    expect(response3.body.data).toEqual([2010, 2020]);

    const grandChildMaterial: Material = await createMaterial({
      name: 'grandChildMaterial',
      parent: childMaterial1,
    });

    // Creating 3 Sourcing Records with 0 toonage, years of those should not be included in response
    const sourcingRecord3: SourcingRecord = await createSourcingRecord({
      year: 2022,
    });

    const sourcingRecord4: SourcingRecord = await createSourcingRecord({
      year: 2019,
      tonnage: 0,
    });

    const sourcingRecord5: SourcingRecord = await createSourcingRecord({
      year: 2018,
      tonnage: 0,
    });
    await createSourcingLocation({
      material: grandChildMaterial,
      sourcingRecords: [sourcingRecord3, sourcingRecord4, sourcingRecord5],
    });

    const response4 = await request(app.getHttpServer())
      .get('/api/v1/h3/years')
      .set('Authorization', `Bearer ${jwtToken}`)
      .query({ layer: 'impact', 'materialIds[]': [childMaterial1.id] });

    expect(response4.body.data).toEqual([2010, 2022]);
  });
});
