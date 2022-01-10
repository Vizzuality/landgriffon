import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { IndicatorSource } from 'modules/indicator-sources/indicator-source.entity';
import { IndicatorSourcesModule } from 'modules/indicator-sources/indicator-sources.module';
import { IndicatorSourceRepository } from 'modules/indicator-sources/indicator-source.repository';
import { createIndicatorSource } from '../../entity-mocks';
import { E2E_CONFIG } from '../../e2e.config';

/**
 * Tests for the IndicatorSourcesModule.
 */

describe('IndicatorSourcesModule (e2e)', () => {
  let app: INestApplication;
  let indicatorSourceRepository: IndicatorSourceRepository;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, IndicatorSourcesModule],
    }).compile();

    indicatorSourceRepository = moduleFixture.get<IndicatorSourceRepository>(
      IndicatorSourceRepository,
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
    await indicatorSourceRepository.delete({});
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Indicator sources - Create', () => {
    test('Create a indicator source should be successful (happy case)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/indicator-sources')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'test indicator source',
        })
        .expect(HttpStatus.CREATED);

      const createdIndicatorSource = await indicatorSourceRepository.findOne(
        response.body.data.id,
      );

      if (!createdIndicatorSource) {
        throw new Error('Error loading created Indicator source');
      }

      expect(createdIndicatorSource.title).toEqual('test indicator source');
    });
  });

  test('Create a indicator source without the required fields should fail with a 400 error', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/indicator-sources')
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

  describe('Indicator sources - Update', () => {
    test('Update a indicator source should be successful (happy case)', async () => {
      const indicatorSource: IndicatorSource = await createIndicatorSource();

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/indicator-sources/${indicatorSource.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          title: 'updated test indicator source',
        })
        .expect(HttpStatus.OK);

      expect(response.body.data.attributes.title).toEqual(
        'updated test indicator source',
      );
    });
  });

  describe('Indicator sources - Delete', () => {
    test('Delete a indicator source should be successful (happy case)', async () => {
      const indicatorSource: IndicatorSource = await createIndicatorSource();

      await request(app.getHttpServer())
        .delete(`/api/v1/indicator-sources/${indicatorSource.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(
        await indicatorSourceRepository.findOne(indicatorSource.id),
      ).toBeUndefined();
    });
  });

  describe('Indicator sources - Get all', () => {
    test('Get all indicator sources should be successful (happy case)', async () => {
      const indicatorSource: IndicatorSource = await createIndicatorSource();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/indicator-sources`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data[0].id).toEqual(indicatorSource.id);
    });
  });

  describe('Indicator sources - Get by id', () => {
    test('Get a indicator source by id should be successful (happy case)', async () => {
      const indicatorSource: IndicatorSource = await createIndicatorSource();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/indicator-sources/${indicatorSource.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send()
        .expect(HttpStatus.OK);

      expect(response.body.data.id).toEqual(indicatorSource.id);
    });
  });
});
