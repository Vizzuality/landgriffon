import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { SourcingLocationGroup } from 'modules/sourcing-location-groups/sourcing-location-group.entity';
import { SourcingLocationGroupsModule } from 'modules/sourcing-location-groups/sourcing-location-groups.module';
import { SourcingLocationGroupRepository } from 'modules/sourcing-location-groups/sourcing-location-group.repository';

/**
 * Tests for the SourcingLocationGroupsModule.
 */

describe('SourcingLocationGroupsModule (e2e)', () => {
  let app: INestApplication;
  let sourcingRecordGroupRepository: SourcingLocationGroupRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, SourcingLocationGroupsModule],
    }).compile();

    sourcingRecordGroupRepository =
      moduleFixture.get<SourcingLocationGroupRepository>(
        SourcingLocationGroupRepository,
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
    await sourcingRecordGroupRepository.delete({});
  });

  afterAll(async () => {
    await Promise.all([app.close()]);
  });

  describe('Sourcing location groups - Create', () => {
    test('Create a sourcing location group should be successful (happy case)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/sourcing-location-groups')
        .send({
          title: 'sourcing location group test name',
        })
        .expect(HttpStatus.CREATED);

      const createdSourcingRecordGroup =
        await sourcingRecordGroupRepository.findOne(response.body.data.id);

      if (!createdSourcingRecordGroup) {
        throw new Error('Error loading created Sourcing location group');
      }

      expect(createdSourcingRecordGroup.title).toEqual(
        'sourcing location group test name',
      );
    });

    test('Create a sourcing location group without the required fields should fail with a 400 error', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/sourcing-location-groups')
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

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/sourcing-location-groups/${sourcingRecordGroup.id}`)
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

      await request(app.getHttpServer())
        .delete(`/api/v1/sourcing-location-groups/${sourcingRecordGroup.id}`)
        .send()
        .expect(HttpStatus.OK);

      expect(
        await sourcingRecordGroupRepository.findOne(sourcingRecordGroup.id),
      ).toBeUndefined();
    });
  });

  describe('Sourcing location groups - Get all', () => {
    test('Get all sourcing location groups should be successful (happy case)', async () => {
      const sourcingRecordGroup: SourcingLocationGroup =
        new SourcingLocationGroup();
      sourcingRecordGroup.title = 'sourcing location group test name';
      await sourcingRecordGroup.save();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/sourcing-location-groups`)
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

      const response = await request(app.getHttpServer())
        .get(`/api/v1/sourcing-location-groups/${sourcingRecordGroup.id}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data.id).toEqual(sourcingRecordGroup.id);
    });
  });
});
