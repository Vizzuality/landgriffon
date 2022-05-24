import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { BusinessUnitsModule } from 'modules/business-units/business-units.module';
import { BusinessUnitRepository } from 'modules/business-units/business-unit.repository';
import { saveUserAndGetToken } from '../../utils/userAuth';
import { getApp } from '../../utils/getApp';
import { UrlParamRepository } from 'modules/url-params/url-param.repository';
import { UrlParamsModule } from 'modules/url-params/url-params.module';

/**
 * Tests for the BusinessUnitsModule.
 */

describe('BusinessUnitsModule (e2e)', () => {
  let app: INestApplication;
  let urlParamRepository: UrlParamRepository;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, UrlParamsModule],
    }).compile();

    urlParamRepository =
      moduleFixture.get<UrlParamRepository>(UrlParamRepository);

    app = getApp(moduleFixture);
    await app.init();
    jwtToken = await saveUserAndGetToken(moduleFixture, app);
  });

  afterEach(async () => {
    await urlParamRepository.delete({});
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Url Params - Create', () => {
    test('Saving URL params received as json should be successful (happy case)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/url-params')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          param: 'test param',
        })
        .expect(HttpStatus.CREATED);

      const savedParam = await urlParamRepository.findOne(response.body.data);

      if (!savedParam) {
        throw new Error('Error loading saved URL Param');
      }

      expect(savedParam).toEqual(response.body.data);
    });

    test('Saving URL params that has been saved before should return the initial id', async () => {
      const initialResponse = await request(app.getHttpServer())
        .post('/api/v1/url-params')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          param: 'test param',
        })
        .expect(HttpStatus.CREATED);

      const secondResponse = await request(app.getHttpServer())
        .post('/api/v1/url-params')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          param: 'test param',
        })
        .expect(HttpStatus.CREATED);

      expect(secondResponse).toEqual(initialResponse.body.data);
    });
  });
});
