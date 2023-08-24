import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import {
  Indicator,
  INDICATOR_STATUS,
  INDICATOR_TYPES,
} from 'modules/indicators/indicator.entity';
import { IndicatorRepository } from 'modules/indicators/indicator.repository';
import { setupTestUser } from '../../utils/userAuth';
import ApplicationManager, {
  TestApplication,
} from '../../utils/application-manager';
import { clearTestDataFromDatabase } from '../../utils/database-test-helper';
import { DataSource } from 'typeorm';
import { createIndicator } from '../../entity-mocks';

/**
 * Tests for the IndicatorsModule.
 */

describe('IndicatorsModule (e2e)', () => {
  let testApplication: TestApplication;
  let dataSource: DataSource;
  let indicatorRepository: IndicatorRepository;
  let jwtToken: string;

  beforeAll(async () => {
    testApplication = await ApplicationManager.init();

    dataSource = testApplication.get<DataSource>(DataSource);

    indicatorRepository =
      testApplication.get<IndicatorRepository>(IndicatorRepository);

    ({ jwtToken } = await setupTestUser(testApplication));
  });

  afterEach(async () => {
    await indicatorRepository.delete({});
  });

  afterAll(async () => {
    await clearTestDataFromDatabase(dataSource);
    await testApplication.close();
  });

  describe('Indicators - Create', () => {
    test('Create an indicator should be successful (happy case)', async () => {
      const response = await request(testApplication.getHttpServer())
        .post('/api/v1/indicators')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          name: 'test indicator',
          nameCode: INDICATOR_TYPES.DEFORESTATION_RISK,
        })
        .expect(HttpStatus.CREATED);

      const createdIndicator = await indicatorRepository.findOne({
        where: { id: response.body.data.id },
      });

      if (!createdIndicator) {
        throw new Error('Error loading created Indicator');
      }

      expect(createdIndicator.name).toEqual('test indicator');
    });
  });

  test('Create an indicator without the required fields should fail with a 400 error', async () => {
    const response = await request(testApplication.getHttpServer())
      .post('/api/v1/indicators')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send();

    expect(HttpStatus.BAD_REQUEST);

    expect(response).toHaveErrorMessage(
      HttpStatus.BAD_REQUEST,
      'Bad Request Exception',
      [
        'name should not be empty',
        'name must be shorter than or equal to 500 characters',
        'name must be longer than or equal to 2 characters',
        'name must be a string',
        'nameCode should not be empty',
        'nameCode must be a string',
      ],
    );
  });

  describe('Indicators - Update', () => {
    test('Update a indicator should be successful (happy case)', async () => {
      const indicator: Indicator = new Indicator();
      indicator.name = 'test indicator';
      indicator.nameCode = 'Midiclorian';
      await indicator.save();

      const response = await request(testApplication.getHttpServer())
        .patch(`/api/v1/indicators/${indicator.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          name: 'updated test indicator',
        })
        .expect(HttpStatus.OK);

      expect(response.body.data.attributes.name).toEqual(
        'updated test indicator',
      );
    });
  });

  describe('Indicators - Delete', () => {
    test('Delete a indicator should be successful (happy case)', async () => {
      const indicator: Indicator = new Indicator();
      indicator.name = 'test indicator';
      indicator.nameCode = 'Midiclorian';
      await indicator.save();

      await request(testApplication.getHttpServer())
        .delete(`/api/v1/indicators/${indicator.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)

        .send()
        .expect(HttpStatus.OK);

      expect(
        await indicatorRepository.findOne({ where: { id: indicator.id } }),
      ).toBeNull();
    });
  });

  describe('Indicators - Get all', () => {
    test('Get all indicators should be successful (happy case)', async () => {
      const indicator: Indicator = new Indicator();
      indicator.name = 'test indicator';
      indicator.nameCode = 'Midiclorian';
      await indicator.save();

      const response = await request(testApplication.getHttpServer())
        .get(`/api/v1/indicators`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data[0].id).toEqual(indicator.id);
    });

    test('When requesting all indicators then indicators with inactive status should be included in results', async () => {
      await createIndicator({
        name: 'Indicator 1',
        nameCode: 'IND_1',
        status: INDICATOR_STATUS.ACTIVE,
      });
      await createIndicator({
        name: 'Indicator 2',
        nameCode: 'IND_2',
        status: INDICATOR_STATUS.INACTIVE,
      });
      const inactiveIndicator: Indicator = await createIndicator({
        name: 'Indicator 3',
        nameCode: 'IND_3',
        status: INDICATOR_STATUS.INACTIVE,
      });

      const response = await request(testApplication.getHttpServer())
        .get(`/api/v1/indicators`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data.length).toEqual(3);

      const foundInactiveIndicator: any = response.body.data.find(
        (indicator: Indicator) => indicator.id === inactiveIndicator.id,
      );

      expect(foundInactiveIndicator.attributes.status).toEqual(
        INDICATOR_STATUS.INACTIVE,
      );
    });
  });

  describe('Indicators - Get by id', () => {
    test('Get a indicator by id should be successful (happy case)', async () => {
      const indicator: Indicator = new Indicator();
      indicator.name = 'test indicator';
      indicator.nameCode = 'Midiclorian';
      await indicator.save();

      const response = await request(testApplication.getHttpServer())
        .get(`/api/v1/indicators/${indicator.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data.id).toEqual(indicator.id);
    });

    test('Get an inactive indicator by id should be successful (happy case)', async () => {
      const indicator: Indicator = new Indicator();
      indicator.name = 'inactive indicator';
      indicator.nameCode = 'IND_INACT';
      indicator.status = INDICATOR_STATUS.INACTIVE;
      await indicator.save();

      const response = await request(testApplication.getHttpServer())
        .get(`/api/v1/indicators/${indicator.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data.id).toEqual(indicator.id);
    });
  });
});
