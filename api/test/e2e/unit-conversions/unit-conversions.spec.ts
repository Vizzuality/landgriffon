import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { UnitConversion } from 'modules/unit-conversions/unit-conversion.entity';
import { UnitConversionsModule } from 'modules/unit-conversions/unit-conversions.module';
import { UnitConversionRepository } from 'modules/unit-conversions/unit-conversion.repository';
import { saveUserAndGetToken } from '../../utils/userAuth';
import { getApp } from '../../utils/getApp';

/**
 * Tests for the UnitConversionsModule.
 */

describe('UnitConversionsModule (e2e)', () => {
  let app: INestApplication;
  let unitConversionRepository: UnitConversionRepository;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, UnitConversionsModule],
    }).compile();

    unitConversionRepository = moduleFixture.get<UnitConversionRepository>(
      UnitConversionRepository,
    );

    app = getApp(moduleFixture);
    await app.init();
    jwtToken = await saveUserAndGetToken(moduleFixture, app);
  });

  afterEach(async () => {
    await unitConversionRepository.delete({});
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Unit conversions - Create', () => {
    test('Create a unit conversion should be successful (happy case)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/unit-conversions')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          unit1: 1234,
        })
        .expect(HttpStatus.CREATED);

      const createdUnitConversion = await unitConversionRepository.findOne({where: { id:
        response.body.data.id,
       }});

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

      const response = await request(app.getHttpServer())
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

      await request(app.getHttpServer())
        .delete(`/api/v1/unit-conversions/${unitConversion.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(
        await unitConversionRepository.findOne({where: { id: unitConversion.id }}),
      ).toBeUndefined();
    });
  });

  describe('Unit conversions - Get all', () => {
    test('Get all unit conversions should be successful (happy case)', async () => {
      const unitConversion: UnitConversion = new UnitConversion();
      await unitConversion.save();

      const response = await request(app.getHttpServer())
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

      const response = await request(app.getHttpServer())
        .get(`/api/v1/unit-conversions/${unitConversion.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data.id).toEqual(unitConversion.id);
    });
  });
});
