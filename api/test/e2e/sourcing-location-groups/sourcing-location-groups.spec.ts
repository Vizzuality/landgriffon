import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { SourcingLocationGroup } from 'modules/sourcing-location-groups/sourcing-location-group.entity';
import { SourcingLocationGroupRepository } from 'modules/sourcing-location-groups/sourcing-location-group.repository';
import { saveUserAndGetTokenWithUserId } from '../../utils/userAuth';
import ApplicationManager, {
  TestApplication,
} from '../../utils/application-manager';
import { clearTestDataFromDatabase } from '../../utils/database-test-helper';
import { DataSource } from 'typeorm';

/**
 * Tests for the SourcingLocationGroupsModule.
 */

describe('SourcingLocationGroupsModule (e2e)', () => {
  let testApplication: TestApplication;
  let dataSource: DataSource;
  let sourcingRecordGroupRepository: SourcingLocationGroupRepository;
  let jwtToken: string;

  beforeAll(async () => {
    testApplication = await ApplicationManager.init();

    dataSource = testApplication.get<DataSource>(DataSource);

    sourcingRecordGroupRepository =
      testApplication.get<SourcingLocationGroupRepository>(
        SourcingLocationGroupRepository,
      );

    ({ jwtToken } = await saveUserAndGetTokenWithUserId(testApplication));
  });

  afterEach(async () => {
    await sourcingRecordGroupRepository.delete({});
  });

  afterAll(async () => {
    await clearTestDataFromDatabase(dataSource);
    await testApplication.close();
  });

  describe('Sourcing location groups - Create', () => {
    test('Create a sourcing location group should be successful (happy case)', async () => {
      const response = await request(testApplication.getHttpServer())
        .post('/api/v1/sourcing-location-groups')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'sourcing location group test name',
        })
        .expect(HttpStatus.CREATED);

      const createdSourcingRecordGroup =
        await sourcingRecordGroupRepository.findOne({
          where: { id: response.body.data.id },
        });

      if (!createdSourcingRecordGroup) {
        throw new Error('Error loading created Sourcing location group');
      }

      expect(createdSourcingRecordGroup.title).toEqual(
        'sourcing location group test name',
      );
    });

    test('Create a sourcing location group without the required fields should fail with a 400 error', async () => {
      const response = await request(testApplication.getHttpServer())
        .post('/api/v1/sourcing-location-groups')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.BAD_REQUEST);

      expect(response).toHaveErrorMessage(
        HttpStatus.BAD_REQUEST,
        'Bad Request Exception',
        [
          'title should not be empty',
          'title must be shorter than or equal to 40 characters',
          'title must be longer than or equal to 2 characters',
          'title must be a string',
        ],
      );
    });
  });

  describe('Sourcing location location - Update', () => {
    test('Update a sourcing location group should be successful (happy case)', async () => {
      const sourcingRecordGroup: SourcingLocationGroup =
        new SourcingLocationGroup();
      sourcingRecordGroup.title = 'sourcing location group test name';
      await sourcingRecordGroup.save();

      const response = await request(testApplication.getHttpServer())
        .patch(`/api/v1/sourcing-location-groups/${sourcingRecordGroup.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'Update sourcing location group title',
        })
        .expect(HttpStatus.OK);

      expect(response.body.data.attributes.title).toEqual(
        'Update sourcing location group title',
      );
    });
  });

  describe('Sourcing location groups - Delete', () => {
    test('Delete a sourcing location group should be successful (happy case)', async () => {
      const sourcingRecordGroup: SourcingLocationGroup =
        new SourcingLocationGroup();
      sourcingRecordGroup.title = 'sourcing location group test name';
      await sourcingRecordGroup.save();

      await request(testApplication.getHttpServer())
        .delete(`/api/v1/sourcing-location-groups/${sourcingRecordGroup.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(
        await sourcingRecordGroupRepository.findOne({
          where: { id: sourcingRecordGroup.id },
        }),
      ).toBeNull();
    });
  });

  describe('Sourcing location groups - Get all', () => {
    test('Get all sourcing location groups should be successful (happy case)', async () => {
      const sourcingRecordGroup: SourcingLocationGroup =
        new SourcingLocationGroup();
      sourcingRecordGroup.title = 'sourcing location group test name';
      await sourcingRecordGroup.save();

      const response = await request(testApplication.getHttpServer())
        .get(`/api/v1/sourcing-location-groups`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data[0].id).toEqual(sourcingRecordGroup.id);
    });
  });

  describe('Sourcing location groups - Get by id', () => {
    test('Get a sourcing location group by id should be successful (happy case)', async () => {
      const sourcingRecordGroup: SourcingLocationGroup =
        new SourcingLocationGroup();
      sourcingRecordGroup.title = 'sourcing location group test name';
      await sourcingRecordGroup.save();

      const response = await request(testApplication.getHttpServer())
        .get(`/api/v1/sourcing-location-groups/${sourcingRecordGroup.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data.id).toEqual(sourcingRecordGroup.id);
    });
  });
});
