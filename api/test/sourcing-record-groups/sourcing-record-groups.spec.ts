import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { SourcingRecordGroup } from 'modules/sourcing-record-groups/sourcing-record-group.entity';
import { SourcingRecordGroupsModule } from 'modules/sourcing-record-groups/sourcing-record-groups.module';
import { SourcingRecordGroupRepository } from 'modules/sourcing-record-groups/sourcing-record-group.repository';

/**
 * Tests for the SourcingRecordGroupsModule.
 */

describe('SourcingRecordGroupsModule (e2e)', () => {
  let app: INestApplication;
  let sourcingRecordGroupRepository: SourcingRecordGroupRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, SourcingRecordGroupsModule],
    }).compile();

    sourcingRecordGroupRepository = moduleFixture.get<SourcingRecordGroupRepository>(
      SourcingRecordGroupRepository,
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

  describe('Sourcing record groups - Create', () => {
    test('Create a sourcing record group should be successful (happy case)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/sourcing-record-groups')
        .send({
          title: 'sourcing record group test name',
        })
        .expect(HttpStatus.CREATED);

      const createdSourcingRecordGroup = await sourcingRecordGroupRepository.findOne(
        response.body.data.id,
      );

      if (!createdSourcingRecordGroup) {
        throw new Error('Error loading created Sourcing record group');
      }

      expect(createdSourcingRecordGroup.title).toEqual(
        'sourcing record group test name',
      );
    });

    test('Create a sourcing record group without the required fields should fail with a 400 error', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/sourcing-record-groups')
        .send()
        .expect(HttpStatus.BAD_REQUEST);

      expect(response).toHaveErrorMessage(HttpStatus.BAD_REQUEST, [
        'title should not be empty',
        'title must be shorter than or equal to 40 characters',
        'title must be longer than or equal to 2 characters',
        'title must be a string',
      ]);
    });
  });

  describe('Sourcing record groups - Update', () => {
    test('Update a sourcing record group should be successful (happy case)', async () => {
      const sourcingRecordGroup: SourcingRecordGroup = new SourcingRecordGroup();
      sourcingRecordGroup.title = 'sourcing record group test name';
      await sourcingRecordGroup.save();

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/sourcing-record-groups/${sourcingRecordGroup.id}`)
        .send({
          title: 'Update sourcing record group title',
        })
        .expect(HttpStatus.OK);

      expect(response.body.data.attributes.title).toEqual(
        'Update sourcing record group title',
      );
    });
  });

  describe('Sourcing record groups - Delete', () => {
    test('Delete a sourcing record group should be successful (happy case)', async () => {
      const sourcingRecordGroup: SourcingRecordGroup = new SourcingRecordGroup();
      sourcingRecordGroup.title = 'sourcing record group test name';
      await sourcingRecordGroup.save();

      await request(app.getHttpServer())
        .delete(`/api/v1/sourcing-record-groups/${sourcingRecordGroup.id}`)
        .send()
        .expect(HttpStatus.OK);

      expect(
        await sourcingRecordGroupRepository.findOne(sourcingRecordGroup.id),
      ).toBeUndefined();
    });
  });

  describe('Sourcing record groups - Get all', () => {
    test('Get all sourcing record groups should be successful (happy case)', async () => {
      const sourcingRecordGroup: SourcingRecordGroup = new SourcingRecordGroup();
      sourcingRecordGroup.title = 'sourcing record group test name';
      await sourcingRecordGroup.save();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/sourcing-record-groups`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data[0].id).toEqual(sourcingRecordGroup.id);
    });
  });

  describe('Sourcing record groups - Get by id', () => {
    test('Get a sourcing record group by id should be successful (happy case)', async () => {
      const sourcingRecordGroup: SourcingRecordGroup = new SourcingRecordGroup();
      sourcingRecordGroup.title = 'sourcing record group test name';
      await sourcingRecordGroup.save();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/sourcing-record-groups/${sourcingRecordGroup.id}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data.id).toEqual(sourcingRecordGroup.id);
    });
  });
});
