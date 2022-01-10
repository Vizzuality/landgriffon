import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { SourcingRecordsModule } from 'modules/sourcing-records/sourcing-records.module';
import { SourcingRecordRepository } from 'modules/sourcing-records/sourcing-record.repository';
import { E2E_CONFIG } from '../../e2e.config';

describe('Sourcing records - Create', () => {
  let app: INestApplication;
  let sourcingRecordRepository: SourcingRecordRepository;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, SourcingRecordsModule],
    }).compile();

    sourcingRecordRepository = moduleFixture.get<SourcingRecordRepository>(
      SourcingRecordRepository,
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
    await sourcingRecordRepository.delete({});
  });
  afterAll(async () => {
    await app.close();
  });

  test('Create a sourcing record should be successful (happy case)', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/sourcing-records')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        tonnage: 1234,
        year: 2020,
      })
      .expect(HttpStatus.CREATED);

    const createdSourcingRecord = await sourcingRecordRepository.findOne(
      response.body.data.id,
    );

    if (!createdSourcingRecord) {
      throw new Error('Error loading created Sourcing Record');
    }

    expect(createdSourcingRecord.tonnage).toEqual('1234');
  });
});
