import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { User } from 'modules/users/user.entity';
import { getApp } from '../../utils/getApp';
import { clearEntityTables } from '../../utils/database-test-helper';
import { saveUserWithRoleAndGetTokenWithUserId } from '../../utils/userAuth';
import { ROLES } from '../../../src/modules/authorization/roles/roles.enum';
import { createIndicator } from '../../entity-mocks';
import {
  Indicator,
  INDICATOR_TYPES,
} from '../../../src/modules/indicators/indicator.entity';

describe('Authorization Test (E2E)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = getApp(moduleFixture);

    await app.init();
  });
  afterEach(async () => {
    await clearEntityTables([User, Indicator]);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authorization Tests (e2e)', () => {
    describe('XLSXL Import', () => {
      test('When I try to import a file, But I have no Admin role, Then I should get an error message', async () => {
        const { jwtToken } = await saveUserWithRoleAndGetTokenWithUserId(
          moduleFixture,
          app,
          ROLES.USER,
        );

        await request(app.getHttpServer())
          .post(`/api/v1/import/sourcing-data`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .send()
          .expect(HttpStatus.FORBIDDEN);
      });
      test('When I try to import a file, And I have no Admin role, Then I should not get Bad Request exception, But my request should be authorised', async () => {
        const { jwtToken } = await saveUserWithRoleAndGetTokenWithUserId(
          moduleFixture,
          app,
          ROLES.ADMIN,
        );

        const response = await request(app.getHttpServer())
          .post(`/api/v1/import/sourcing-data`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .send()
          .expect(HttpStatus.BAD_REQUEST);

        expect(response.body.errors[0].title).toEqual(
          'A .XLSX file must be provided as payload',
        );
      });
    });
    describe('Indicators', () => {
      test('When I want to list indicators, And I have no Admin roles, I should be allowed', async () => {
        const { jwtToken } = await saveUserWithRoleAndGetTokenWithUserId(
          moduleFixture,
          app,
          ROLES.USER,
        );
        await request(app.getHttpServer())
          .get(`/api/v1/indicators/`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .send()
          .expect(HttpStatus.OK);

        const indicator = await createIndicator({
          nameCode: INDICATOR_TYPES.CARBON_EMISSIONS,
        });

        await request(app.getHttpServer())
          .get(`/api/v1/indicators/${indicator.id}`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .send()
          .expect(HttpStatus.OK);
      });
      test('When I want to create, update or delete a Indicator, And I have no Admin roles, Then I should get a error response', async () => {
        const { jwtToken } = await saveUserWithRoleAndGetTokenWithUserId(
          moduleFixture,
          app,
          ROLES.USER,
        );
        await request(app.getHttpServer())
          .post(`/api/v1/indicators/`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .send()
          .expect(HttpStatus.FORBIDDEN);

        const indicator = await createIndicator({
          nameCode: INDICATOR_TYPES.CARBON_EMISSIONS,
        });

        await request(app.getHttpServer())
          .delete(`/api/v1/indicators/${indicator.id}`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .send()
          .expect(HttpStatus.FORBIDDEN);

        await request(app.getHttpServer())
          .patch(`/api/v1/indicators/${indicator.id}`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .send()
          .expect(HttpStatus.FORBIDDEN);
      });
    });
  });
});
