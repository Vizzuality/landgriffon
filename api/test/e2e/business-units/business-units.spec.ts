import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { BusinessUnitsModule } from 'modules/business-units/business-units.module';
import { BusinessUnitRepository } from 'modules/business-units/business-unit.repository';
import { saveUserAndGetTokenWithUserId } from '../../utils/userAuth';
import AppSingleton from '../../utils/getApp';
import { clearEntityTables } from '../../utils/database-test-helper';
import { User } from 'modules/users/user.entity';
import { DataSource } from 'typeorm';

/**
 * Tests for the BusinessUnitsModule.
 */

describe('BusinessUnitsModule (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let businessUnitRepository: BusinessUnitRepository;
  let jwtToken: string;

  beforeAll(async () => {
    const appSingleton = await AppSingleton.init();
    app = appSingleton.app;
    const moduleFixture = appSingleton.moduleFixture;

    dataSource = moduleFixture.get<DataSource>(DataSource);

    businessUnitRepository = moduleFixture.get<BusinessUnitRepository>(
      BusinessUnitRepository,
    );

    ({ jwtToken } = await saveUserAndGetTokenWithUserId(moduleFixture, app));
  });

  afterEach(async () => {
    await businessUnitRepository.delete({});
  });

  afterAll(async () => {
    await clearEntityTables(dataSource, [User]);
    await app.close();
  });

  describe('Business units - Create', () => {
    test('Create a business unit should be successful (happy case)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/business-units')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          name: 'test business unit',
        })
        .expect(HttpStatus.CREATED);

      const createdBusinessUnit = await businessUnitRepository.findOne({
        where: { id: response.body.data.id },
      });

      if (!createdBusinessUnit) {
        throw new Error('Error loading created Business Unit');
      }

      expect(createdBusinessUnit.name).toEqual('test business unit');
    });
  });

  test('Create a business unit without the required fields should fail with a 400 error', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/business-units')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send()
      .expect(HttpStatus.BAD_REQUEST);

    expect(response).toHaveErrorMessage(
      HttpStatus.BAD_REQUEST,
      'Bad Request Exception',
      [
        'name should not be empty',
        'name must be shorter than or equal to 400 characters',
        'name must be longer than or equal to 2 characters',
        'name must be a string',
      ],
    );
  });

  describe('Business units - Update', () => {
    test('Update a business unit should be successful (happy case)', async () => {
      const businessUnit: BusinessUnit = new BusinessUnit();
      businessUnit.name = 'test business unit';
      await businessUnit.save();

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/business-units/${businessUnit.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          name: 'updated test business unit',
        })
        .expect(HttpStatus.OK);

      expect(response.body.data.attributes.name).toEqual(
        'updated test business unit',
      );
    });
  });

  describe('Business units - Delete', () => {
    test('Delete a business unit should be successful (happy case)', async () => {
      const businessUnit: BusinessUnit = new BusinessUnit();
      businessUnit.name = 'test business unit';
      await businessUnit.save();

      await request(app.getHttpServer())
        .delete(`/api/v1/business-units/${businessUnit.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(
        await businessUnitRepository.findOne({
          where: { id: businessUnit.id },
        }),
      ).toBeNull();
    });
  });

  describe('Business units - Get all', () => {
    test('Get all business units should be successful (happy case)', async () => {
      const businessUnit: BusinessUnit = new BusinessUnit();
      businessUnit.name = 'test business unit';
      await businessUnit.save();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/business-units`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data[0].id).toEqual(businessUnit.id);
    });
  });

  describe('Business units - Get by id', () => {
    test('Get a business unit by id should be successful (happy case)', async () => {
      const businessUnit: BusinessUnit = new BusinessUnit();
      businessUnit.name = 'test business unit';
      await businessUnit.save();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/business-units/${businessUnit.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data.id).toEqual(businessUnit.id);
    });
  });
});
