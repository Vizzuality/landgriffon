import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { SourcingLocationsModule } from 'modules/sourcing-locations/sourcing-locations.module';
import { SourcingLocationRepository } from 'modules/sourcing-locations/sourcing-location.repository';

/**
 * Tests for the SourcingLocationsModule.
 */

describe('SourcingLocationsModule (e2e)', () => {
  let app: INestApplication;
  let sourcingLocationRepository: SourcingLocationRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, SourcingLocationsModule],
    }).compile();

    sourcingLocationRepository = moduleFixture.get<SourcingLocationRepository>(
      SourcingLocationRepository,
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
    await sourcingLocationRepository.delete({});
  });

  afterAll(async () => {
    await Promise.all([app.close()]);
  });

  describe('Sourcing locations - Create', () => {
    test('Create a sourcing location should be successful (happy case)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/sourcing-locations')
        .send({
          title: 'test sourcing location',
          locationAddressInput: 'pqrst',
          locationCountryInput: 'uvwxy',
        })
        .expect(HttpStatus.CREATED);

      const createdSourcingLocation = await sourcingLocationRepository.findOne(
        response.body.data.id,
      );

      if (!createdSourcingLocation) {
        throw new Error('Error loading created Sourcing location');
      }

      expect(createdSourcingLocation.title).toEqual('test sourcing location');
    });
  });

  describe('Sourcing locations - Update', () => {
    test('Update a sourcing location should be successful (happy case)', async () => {
      const sourcingLocation: SourcingLocation = new SourcingLocation();
      sourcingLocation.title = 'test sourcing location';
      await sourcingLocation.save();

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/sourcing-locations/${sourcingLocation.id}`)
        .send({
          title: 'updated test sourcing location',
        })
        .expect(HttpStatus.OK);

      expect(response.body.data.attributes.title).toEqual(
        'updated test sourcing location',
      );
    });
  });

  describe('Sourcing locations - Delete', () => {
    test('Delete a sourcing location should be successful (happy case)', async () => {
      const sourcingLocation: SourcingLocation = new SourcingLocation();
      sourcingLocation.title = 'test sourcing location';
      await sourcingLocation.save();

      await request(app.getHttpServer())
        .delete(`/api/v1/sourcing-locations/${sourcingLocation.id}`)
        .send()
        .expect(HttpStatus.OK);

      expect(
        await sourcingLocationRepository.findOne(sourcingLocation.id),
      ).toBeUndefined();
    });
  });

  describe('Sourcing locations - Get all', () => {
    test('Get all sourcing locations should be successful (happy case)', async () => {
      const sourcingLocation: SourcingLocation = new SourcingLocation();
      sourcingLocation.title = 'test sourcing location';
      await sourcingLocation.save();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/sourcing-locations`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data[0].id).toEqual(sourcingLocation.id);
    });
  });

  describe('Sourcing locations - Get by id', () => {
    test('Get a sourcing location by id should be successful (happy case)', async () => {
      const sourcingLocation: SourcingLocation = new SourcingLocation();
      sourcingLocation.title = 'test sourcing location';
      await sourcingLocation.save();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/sourcing-locations/${sourcingLocation.id}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data.id).toEqual(sourcingLocation.id);
    });
  });
});
