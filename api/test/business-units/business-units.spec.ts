import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { BusinessUnitsModule } from 'modules/business-units/business-units.module';
import { BusinessUnitRepository } from 'modules/business-units/business-unit.repository';

/**
 * Tests for the BusinessUnitsModule.
 */

describe('BusinessUnitsModule (e2e)', () => {
  let app: INestApplication;
  let businessUnitRepository: BusinessUnitRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, BusinessUnitsModule],
    }).compile();

    businessUnitRepository = moduleFixture.get<BusinessUnitRepository>(
      BusinessUnitRepository,
    );

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
    await businessUnitRepository.delete({});
  });

  afterAll(async () => {
    await Promise.all([app.close()]);
  });

  describe('Business units - Create', () => {
    test('Create a business unit should be successful (happy case)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/business-units')
        .send({
          name: 'test business unit',
        })
        .expect(HttpStatus.CREATED);

      const createdBusinessUnit = await businessUnitRepository.findOne(
        response.body.data.id,
      );

      if (!createdBusinessUnit) {
        throw new Error('Error loading created Business Unit');
      }

      expect(createdBusinessUnit.name).toEqual('test business unit');
    });
  });

  describe('Business units - Update', () => {
    test('Update a business unit should be successful (happy case)', async () => {
      const businessUnit: BusinessUnit = new BusinessUnit();
      businessUnit.name = 'test business unit';
      await businessUnit.save();

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/business-units/${businessUnit.id}`)
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
        .send()
        .expect(HttpStatus.OK);

      expect(
        await businessUnitRepository.findOne(businessUnit.id),
      ).toBeUndefined();
    });
  });

  describe('Business units - Get all', () => {
    test('Get all business units should be successful (happy case)', async () => {
      const businessUnit: BusinessUnit = new BusinessUnit();
      businessUnit.name = 'test business unit';
      await businessUnit.save();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/business-units`)
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
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data.id).toEqual(businessUnit.id);
    });
  });
});
