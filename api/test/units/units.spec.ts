import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { Unit } from 'modules/units/unit.entity';
import { UnitsModule } from 'modules/units/units.module';
import { UnitRepository } from 'modules/units/unit.repository';

/**
 * Tests for the UnitsModule.
 */

describe('UnitsModule (e2e)', () => {
  let app: INestApplication;
  let unitRepository: UnitRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, UnitsModule],
    }).compile();

    unitRepository = moduleFixture.get<UnitRepository>(UnitRepository);

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
    await unitRepository.delete({});
  });

  afterAll(async () => {
    await Promise.all([app.close()]);
  });

  describe('Units - Create', () => {
    test('Create a unit should be successful (happy case)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/units')
        .send({
          name: 'test unit',
        })
        .expect(HttpStatus.CREATED);

      const createdUnit = await unitRepository.findOne(response.body.data.id);

      if (!createdUnit) {
        throw new Error('Error loading created Unit');
      }

      expect(createdUnit.name).toEqual('test unit');
    });

    test('Create a unit without the required fields should fail with a 400 error', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/units')
        .send()
        .expect(HttpStatus.BAD_REQUEST);

      expect(response).toHaveErrorMessage(HttpStatus.BAD_REQUEST, [
        'name should not be empty',
        'name must be shorter than or equal to 40 characters',
        'name must be longer than or equal to 2 characters',
        'name must be a string',
      ]);
    });
  });

  describe('Units - Update', () => {
    test('Update a unit should be successful (happy case)', async () => {
      const unit: Unit = new Unit();
      unit.name = 'test unit';
      await unit.save();

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/units/${unit.id}`)
        .send({
          name: 'Updated test unit',
        })
        .expect(HttpStatus.OK);

      expect(response.body.data.attributes.name).toEqual('Updated test unit');
    });
  });

  describe('Units - Delete', () => {
    test('Delete a unit should be successful (happy case)', async () => {
      const unit: Unit = new Unit();
      unit.name = 'test unit';
      await unit.save();

      await request(app.getHttpServer())
        .delete(`/api/v1/units/${unit.id}`)
        .send()
        .expect(HttpStatus.OK);

      expect(await unitRepository.findOne(unit.id)).toBeUndefined();
    });
  });

  describe('Units - Get all', () => {
    test('Get all units should be successful (happy case)', async () => {
      const unit: Unit = new Unit();
      unit.name = 'test unit';
      await unit.save();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/units`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data[0].id).toEqual(unit.id);
    });
  });

  describe('Units - Get by id', () => {
    test('Get a unit by id should be successful (happy case)', async () => {
      const unit: Unit = new Unit();
      unit.name = 'test unit';
      await unit.save();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/units/${unit.id}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data.id).toEqual(unit.id);
    });
  });
});
