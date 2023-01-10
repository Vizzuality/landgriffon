import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { UnitConversion } from 'modules/unit-conversions/unit-conversion.entity';
import { UnitConversionRepository } from 'modules/unit-conversions/unit-conversion.repository';
import { saveUserAndGetTokenWithUserId } from '../../utils/userAuth';
import ApplicationManager, {
  TestApplication,
} from '../../utils/application-manager';
import { clearTestDataFromDatabase } from '../../utils/database-test-helper';
import { DataSource } from 'typeorm';

/**
 * Tests for the UnitConversionsModule.
 */

describe('UnitConversionsModule (e2e)', () => {
  let testApplication: TestApplication;
  let dataSource: DataSource;
  let unitConversionRepository: UnitConversionRepository;
  let jwtToken: string;

  beforeAll(async () => {
    testApplication = await ApplicationManager.init();

    dataSource = testApplication.get<DataSource>(DataSource);

    unitConversionRepository = testApplication.get<UnitConversionRepository>(
      UnitConversionRepository,
    );

    ({ jwtToken } = await saveUserAndGetTokenWithUserId(testApplication));
  });

  afterEach(async () => {
    await unitConversionRepository.delete({});
  });

  afterAll(async () => {
    await clearTestDataFromDatabase(dataSource);
    await testApplication.close();
  });

  describe('Unit conversions - Create', () => {
    test('Create a unit conversion should be successful (happy case)', async () => {
      const response = await request(testApplication.getHttpServer())
        .post('/api/v1/unit-conversions')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          unit1: 1234,
        })
        .expect(HttpStatus.CREATED);

      const createdUnitConversion = await unitConversionRepository.findOne({
        where: { id: response.body.data.id },
      });

      if (!createdUnitConversion) {
        throw new Error('Error loading created Unit Conversion');
      }

      expect(createdUnitConversion.unit1).toEqual('1234');
    });
  });

  describe('Unit conversions - Update', () => {
    test('Update a unit conversion should be successful (happy case)', async () => {
      const unitConversion: UnitConversion = new UnitConversion();
      await unitConversion.save();

      const response = await request(testApplication.getHttpServer())
        .patch(`/api/v1/unit-conversions/${unitConversion.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          unit1: 1234,
        })
        .expect(HttpStatus.OK);

      expect(response.body.data.attributes.unit1).toEqual(1234);
    });
  });

  describe('Unit conversions - Delete', () => {
    test('Delete a unit conversion should be successful (happy case)', async () => {
      const unitConversion: UnitConversion = new UnitConversion();
      await unitConversion.save();

      await request(testApplication.getHttpServer())
        .delete(`/api/v1/unit-conversions/${unitConversion.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(
        await unitConversionRepository.findOne({
          where: { id: unitConversion.id },
        }),
      ).toBeNull();
    });
  });

  describe('Unit conversions - Get all', () => {
    test('Get all unit conversions should be successful (happy case)', async () => {
      const unitConversion: UnitConversion = new UnitConversion();
      await unitConversion.save();

      const response = await request(testApplication.getHttpServer())
        .get(`/api/v1/unit-conversions`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data[0].id).toEqual(unitConversion.id);
    });
  });

  describe('Unit conversions - Get by id', () => {
    test('Get a unit conversion by id should be successful (happy case)', async () => {
      const unitConversion: UnitConversion = new UnitConversion();
      await unitConversion.save();

      const response = await request(testApplication.getHttpServer())
        .get(`/api/v1/unit-conversions/${unitConversion.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data.id).toEqual(unitConversion.id);
    });
  });
});
