import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { SourcingRecordsModule } from 'modules/sourcing-records/sourcing-records.module';
import { SourcingRecordRepository } from 'modules/sourcing-records/sourcing-record.repository';
import { createSourcingRecord } from '../../entity-mocks';
import { E2E_CONFIG } from '../../e2e.config';

describe('Sourcing records - Get years', () => {
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

  test('Get years from sourcing records should be successful and return the years present in the sourcing records (no duplicates)', async () => {
    await createSourcingRecord({ year: 2001 });
    await createSourcingRecord({ year: 2001 });
    await createSourcingRecord({ year: 2002 });
    await createSourcingRecord({ year: 2002 });
    await createSourcingRecord({ year: 2003 });
    await createSourcingRecord({ year: 2007 });

    const response = await request(app.getHttpServer())
      .get(`/api/v1/sourcing-records/years`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send()
      .expect(HttpStatus.OK);

    expect(response.body.data).toEqual([2001, 2002, 2003, 2007]);
  });

  test('Get years from sourcing records should be successful and return an empty array if there are no sourcing records', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/sourcing-records/years`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send()
      .expect(HttpStatus.OK);

    expect(response.body.data).toEqual([]);
  });
});
