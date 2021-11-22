import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { SourcingRecordsModule } from 'modules/sourcing-records/sourcing-records.module';
import { SourcingRecordRepository } from 'modules/sourcing-records/sourcing-record.repository';
import { createSourcingLocation, createSourcingRecord } from '../entity-mocks';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { SourcingLocationRepository } from 'modules/sourcing-locations/sourcing-location.repository';

describe('Sourcing records -Filters', () => {
  let app: INestApplication;
  let sourcingRecordRepository: SourcingRecordRepository;
  let sourcingLocationRepository: SourcingLocationRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, SourcingRecordsModule],
    }).compile();

    sourcingRecordRepository = moduleFixture.get<SourcingRecordRepository>(
      SourcingRecordRepository,
    );
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
    await sourcingRecordRepository.delete({});
  });

  afterAll(async () => {
    await app.close();
  });

  /**
   * @debt: Right now we can add sourcing-data with no sourcing-location. This opens a door with new many use cases that worth testing
   * but we will most likely restrict this behaviour, and related test will require an update
   * Thats the reason I see no value adding these use cases
   */

  test('When I fetch a sourcing-record and I include its sourcing-location relation in the query, then I should receive said sourcing-record and its sourcing-location', async () => {
    const sourcingLocation: SourcingLocation = await createSourcingLocation();
    const sourcingRecord: SourcingRecord = await createSourcingRecord({
      sourcingLocation: sourcingLocation,
    });
    const response = await request(app.getHttpServer())
      .get(
        `/api/v1/sourcing-records/${sourcingRecord.id}?include=sourcingLocation`,
      )
      .send()
      .expect(HttpStatus.OK);

    expect(response.body.data.attributes.sourcingLocation).toMatchObject({
      ...sourcingLocation,
      updatedAt: expect.any(String),
      createdAt: expect.any(String),
    });
  });
});
