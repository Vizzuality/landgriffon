import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { GeoRegion } from 'modules/geo-regions/geo-region.entity';
import { GeoRegionsModule } from 'modules/geo-regions/geo-regions.module';
import { GeoRegionRepository } from 'modules/geo-regions/geo-region.repository';
import { E2E_CONFIG } from '../../e2e.config';

/**
 * Tests for the GeoRegionsModule.
 */

describe('GeoRegionsModule (e2e)', () => {
  let app: INestApplication;
  let geoRegionRepository: GeoRegionRepository;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, GeoRegionsModule],
    }).compile();

    geoRegionRepository =
      moduleFixture.get<GeoRegionRepository>(GeoRegionRepository);

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    await request(app.getHttpServer())
      .post('/auth/sign-up')
      .send(E2E_CONFIG.users.signUp)
      .expect(HttpStatus.CREATED);
    const response = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send(E2E_CONFIG.users.signIn)
      .expect(HttpStatus.CREATED);
    jwtToken = response.body.accessToken;
  });

  afterEach(async () => {
    await geoRegionRepository.delete({});
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Geo regions - Create', () => {
    test('Create a geo region should be successful (happy case)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/geo-regions')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          name: 'test geo region',
        })
        .expect(HttpStatus.CREATED);

      const createdGeoRegion = await geoRegionRepository.findOne(
        response.body.data.id,
      );

      if (!createdGeoRegion) {
        throw new Error('Error loading created Geo region');
      }

      expect(createdGeoRegion.name).toEqual('test geo region');
      expect(createdGeoRegion.isCreatedByUser).toEqual(true);
    });
  });

  test('Create a geo region without the required fields should fail with a 400 error', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/geo-regions')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send()
      .expect(HttpStatus.BAD_REQUEST);

    expect(response).toHaveErrorMessage(
      HttpStatus.BAD_REQUEST,
      'Bad Request Exception',
      [
        'name should not be empty',
        'name must be shorter than or equal to 40 characters',
        'name must be longer than or equal to 2 characters',
        'name must be a string',
      ],
    );
  });

  describe('Geo regions - Update', () => {
    test('Update a geo region should be successful (happy case)', async () => {
      const geoRegion: GeoRegion = new GeoRegion();
      geoRegion.name = 'test geo region';
      await geoRegion.save();

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/geo-regions/${geoRegion.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          name: 'updated test geo region',
        })
        .expect(HttpStatus.OK);

      expect(response.body.data.attributes.name).toEqual(
        'updated test geo region',
      );
    });
  });

  describe('Geo regions - Delete', () => {
    test('Delete a geo region should be successful (happy case)', async () => {
      const geoRegion: GeoRegion = new GeoRegion();
      geoRegion.name = 'test geo region';
      await geoRegion.save();

      await request(app.getHttpServer())
        .delete(`/api/v1/geo-regions/${geoRegion.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(await geoRegionRepository.findOne(geoRegion.id)).toBeUndefined();
    });
  });

  describe('Geo regions - Get all', () => {
    test('Get all geo regions should be successful (happy case)', async () => {
      const geoRegion: GeoRegion = new GeoRegion();
      geoRegion.name = 'test geo region';
      await geoRegion.save();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/geo-regions`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data[0].id).toEqual(geoRegion.id);
    });
  });

  describe('Geo regions - Get by id', () => {
    test('Get a geo region by id should be successful (happy case)', async () => {
      const geoRegion: GeoRegion = new GeoRegion();
      geoRegion.name = 'test geo region';
      await geoRegion.save();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/geo-regions/${geoRegion.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data.id).toEqual(geoRegion.id);
    });
  });
});
