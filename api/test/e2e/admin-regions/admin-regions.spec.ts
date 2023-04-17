import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { AdminRegionRepository } from 'modules/admin-regions/admin-region.repository';
import { setupTestUser } from '../../utils/userAuth';
import ApplicationManager, {
  TestApplication,
} from '../../utils/application-manager';
import { clearTestDataFromDatabase } from '../../utils/database-test-helper';
import { DataSource } from 'typeorm';

/**
 * Tests for the AdminRegionsModule.
 */

describe('AdminRegionsModule (e2e)', () => {
  let testApplication: TestApplication;
  let dataSource: DataSource;
  let adminRegionRepository: AdminRegionRepository;
  let jwtToken: string;

  beforeAll(async () => {
    testApplication = await ApplicationManager.init();

    dataSource = testApplication.get<DataSource>(DataSource);

    adminRegionRepository = testApplication.get<AdminRegionRepository>(
      AdminRegionRepository,
    );

    ({ jwtToken } = await setupTestUser(testApplication));
  });

  afterEach(async () => {
    await adminRegionRepository.delete({});
  });

  afterAll(async () => {
    await clearTestDataFromDatabase(dataSource);
    await testApplication.close();
  });

  describe('Admin regions - Create', () => {
    test('Create a admin region should be successful (happy case)', async () => {
      const response = await request(testApplication.getHttpServer())
        .post('/api/v1/admin-regions')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          name: 'test admin region',
        })
        .expect(HttpStatus.CREATED);

      const createdAdminRegion = await adminRegionRepository.findOne({
        where: { id: response.body.data.id },
      });

      if (!createdAdminRegion) {
        throw new Error('Error loading created Admin region');
      }

      expect(createdAdminRegion.name).toEqual('test admin region');
    });
  });

  test.skip('Create a admin region without the required fields should fail with a 400 error', async () => {
    const response = await request(testApplication.getHttpServer())
      .post('/api/v1/admin-regions')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send()
      .expect(HttpStatus.BAD_REQUEST);

    expect(response).toHaveErrorMessage(
      HttpStatus.BAD_REQUEST,
      'Bad Request Exception',
      [
        'name should not be empty',
        'name must be shorter than or equal to 100 characters',
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

      const response = await request(testApplication.getHttpServer())
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

      await request(testApplication.getHttpServer())
        .delete(`/api/v1/admin-regions/${adminRegion.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(
        await adminRegionRepository.findOne({ where: { id: adminRegion.id } }),
      ).toBeNull();
    });
  });

  describe('Admin regions - Get all', () => {
    test('Get all admin regions should be successful (happy case)', async () => {
      const adminRegion: AdminRegion = new AdminRegion();
      adminRegion.name = 'test admin region';
      await adminRegion.save();

      const response = await request(testApplication.getHttpServer())
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

      const response = await request(testApplication.getHttpServer())
        .get(`/api/v1/admin-regions/${adminRegion.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data.id).toEqual(adminRegion.id);
    });
  });
});
