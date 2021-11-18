import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { H3DataRepository } from '../../src/modules/h3-data/h3-data.repository';
import { H3DataModule } from '../../src/modules/h3-data/h3-data.module';
import {
  createFakeH3Data,
  createRandomNamesForH3TableAndColumns,
  dropFakeH3Data,
} from './mocks/create-fake-h3-data';
import { MaterialRepository } from '../../src/modules/materials/material.repository';
import {
  createIndicator,
  createMaterial,
  createSourcingRecord,
} from '../entity-mocks';
import { H3Data } from '../../src/modules/h3-data/h3-data.entity';
import { Material } from '../../src/modules/materials/material.entity';
import { Indicator } from '../../src/modules/indicators/indicator.entity';

/**
 * Tests for the H3DataModule.
 */

describe('H3-Data Module (e2e) - Get H3 data', () => {
  let app: INestApplication;
  let h3DataRepository: H3DataRepository;
  let materialRepository: MaterialRepository;
  const fakeTable = 'faketable';
  const fakeColumn = 'fakecolumn';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, H3DataModule],
    }).compile();

    h3DataRepository = moduleFixture.get<H3DataRepository>(H3DataRepository);
    materialRepository =
      moduleFixture.get<MaterialRepository>(MaterialRepository);

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await materialRepository.delete({});
    await h3DataRepository.delete({});
    await dropFakeH3Data([fakeTable]);
  });

  afterAll(async () => {
    await app.close();
  });

  test('Given the H3 Data table is empty, when I query the API, then I should be acknowledged that no requested H3 Data has been found ', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/h3/data/${fakeTable}/${fakeColumn}`)
      .expect(HttpStatus.NOT_FOUND);

    expect(response.body.errors[0].title).toEqual(
      `H3 ${fakeColumn} data in ${fakeTable} could not been found`,
    );
  });

  test('Given the H3 Data table is populated, when I query the API, then I should get its data in with h3index as key, and column values as value', async () => {
    await createFakeH3Data(fakeTable, fakeColumn);

    const response = await request(app.getHttpServer())
      .get(`/api/v1/h3/data/${fakeTable}/${fakeColumn}`)
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
      .query({ layer: 'impact' })
      .expect(HttpStatus.OK);

    expect(response.body.data).toEqual([...new Set(years)]);
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
      .query({ layer: 'material' })
      .expect(HttpStatus.OK);
    expect(response.body.data).toEqual([...new Set(years)]);
  });

  test('Given there is material H3 data, When I query available years providing a material id, then I should get all available years for that material', async () => {
    const years = [2001, 2001, 2002, 2003, 2007];
    const fakeH3MasterData: Array<Partial<H3Data>> = [];
    for await (const year of years) {
      fakeH3MasterData.push({
        h3tableName: createRandomNamesForH3TableAndColumns(),
        h3columnName: createRandomNamesForH3TableAndColumns(),
        h3resolution: 6,
        year,
      });
      const savedH3DataRows: H3Data[] = await h3DataRepository.save(
        fakeH3MasterData,
      );
      const savedMaterials: Material[] = [];
      for await (const h3row of savedH3DataRows) {
        savedMaterials.push(await createMaterial({ harvestId: h3row.id }));
      }

      const response = await request(app.getHttpServer())
        .get('/api/v1/h3/years')
        .query({ layer: 'material', materialId: savedMaterials[0].id });
      const materialH3Data: H3Data[] = await h3DataRepository.find({
        id: savedMaterials[0].harvestId,
      });

      expect(materialH3Data[0].id).toEqual(savedMaterials[0].harvestId);
      expect(response.body.data).toEqual([2001]);
    }
  });
  test('Given there is Indicator H3 data, When I query the API for Risk layer, then I should get all available years that are indicator type', async () => {
    const years = [2001, 2001, 2002, 2003, 2007];
    const fakeH3MasterData: Array<Partial<H3Data>> = [];
    for await (const year of years) {
      const { id } = await createIndicator({
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
      .query({ layer: 'risk' })
      .expect(HttpStatus.OK);

    expect(response.body.data).toEqual([2001, 2002, 2003, 2007]);
  });
  test('Given there is material H3 data, When I query available years providing a indicator id, then I should get all available years for that indicator', async () => {
    const years = [2001, 2001, 2002, 2003, 2007];
    const savedIndicator: Indicator = await createIndicator();
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
      .query({ layer: 'risk', indicatorId: savedIndicator.id })
      .expect(HttpStatus.OK);

    expect(response.body.data).toEqual([2001, 2002, 2003, 2007]);
  });
  test('When I query the API for available years with a non-valid layer type, then I should get a proper error message', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/h3/years')
      .query({ layer: 'thisIsCertainlyNotAValidLayerType' })
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body.errors[0].meta.rawError.response.message).toEqual([
      'Available layers types: impact, risk, material',
    ]);
  });
});
