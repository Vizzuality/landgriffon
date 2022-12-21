import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { User } from 'modules/users/user.entity';
import { getApp } from '../../utils/getApp';
import { clearEntityTables } from '../../utils/database-test-helper';
import { saveUserWithRoleAndGetTokenWithUserId } from '../../utils/userAuth';
import { ROLES } from '../../../src/modules/authorization/roles/roles.enum';

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
    await clearEntityTables([User]);
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
          .send();

        expect(HttpStatus.FORBIDDEN);
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
          .send();

        expect(HttpStatus.BAD_REQUEST);
        expect(response.body.errors[0].title).toEqual(
          'A .XLSX file must be provided as payload',
        );
      });
    });
  });
});
