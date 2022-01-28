import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { AdminRegionsModule } from 'modules/admin-regions/admin-regions.module';
import { AdminRegionRepository } from 'modules/admin-regions/admin-region.repository';
import { E2E_CONFIG } from '../../e2e.config';

/**
 * Tests for the AdminRegionsModule.
 */

describe('AdminRegionsModule (e2e)', () => {
  let app: INestApplication;
  let adminRegionRepository: AdminRegionRepository;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, AdminRegionsModule],
    }).compile();

    adminRegionRepository = moduleFixture.get<AdminRegionRepository>(
      AdminRegionRepository,
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
    await adminRegionRepository.delete({});
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Admin regions - Create', () => {
    test('Create a admin region should be successful (happy case)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin-regions')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          name: 'test admin region',
        })
        .expect(HttpStatus.CREATED);

      const createdAdminRegion = await adminRegionRepository.findOne(
        response.body.data.id,
      );

      if (!createdAdminRegion) {
        throw new Error('Error loading created Admin region');
      }

      expect(createdAdminRegion.name).toEqual('test admin region');
    });
  });

  test('Create a admin region without the required fields should fail with a 400 error', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/admin-regions')
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

  describe('Admin regions - Update', () => {
    test('Update a admin region should be successful (happy case)', async () => {
      const adminRegion: AdminRegion = new AdminRegion();
      adminRegion.name = 'test admin region';
      await adminRegion.save();

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/admin-regions/${adminRegion.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          name: 'updated test admin region',
        })
        .expect(HttpStatus.OK);

      expect(response.body.data.attributes.name).toEqual(
        'updated test admin region',
      );
    });
  });

  describe('Admin regions - Delete', () => {
    test('Delete a admin region should be successful (happy case)', async () => {
      const adminRegion: AdminRegion = new AdminRegion();
      adminRegion.name = 'test admin region';
      await adminRegion.save();

      await request(app.getHttpServer())
        .delete(`/api/v1/admin-regions/${adminRegion.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(
        await adminRegionRepository.findOne(adminRegion.id),
      ).toBeUndefined();
    });
  });

  describe('Admin regions - Get all', () => {
    test('Get all admin regions should be successful (happy case)', async () => {
      const adminRegion: AdminRegion = new AdminRegion();
      adminRegion.name = 'test admin region';
      await adminRegion.save();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/admin-regions`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data[0].id).toEqual(adminRegion.id);
    });
  });

  describe('Admin regions - Get by id', () => {
    test('Get a admin region by id should be successful (happy case)', async () => {
      const adminRegion: AdminRegion = new AdminRegion();
      adminRegion.name = 'test admin region';
      await adminRegion.save();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/admin-regions/${adminRegion.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data.id).toEqual(adminRegion.id);
    });
  });
});
