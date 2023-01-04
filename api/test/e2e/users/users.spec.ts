import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, Logger } from '@nestjs/common';
import * as faker from 'faker';
import * as request from 'supertest';
import { Response } from 'supertest';
import { AppModule } from 'app.module';
import { E2E_CONFIG } from '../../e2e.config';
import { v4 } from 'uuid';
import { SignUpDto } from 'modules/authentication/dto/sign-up.dto';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiEvent } from 'modules/api-events/api-event.entity';
import { ApiEventsModule } from 'modules/api-events/api-events.module';
import { UsersModule } from 'modules/users/users.module';
import { LoginDto } from 'modules/authentication/dto/login.dto';
import { getApp } from '../../utils/getApp';

/**
 * Tests for the UsersModule.
 *
 * Given that we create user accounts, update user data, reset passwords, delete
 * accounts and recreate them, the tests in this file rely on a different setup
 * than what we use in most other e2e test files.
 *
 * Authentication is split off app setup, and is executed in `beforeAll()`
 * callbacks in individual `describe()` blocks.
 *
 * Please be mindful of this when adding new tests or updating existing ones.
 */

describe('UsersModule (e2e)', () => {
  let app: INestApplication;

  const aNewPassword = 'aNewPassword123!';

  const signUpDto: SignUpDto = {
    email: `${v4()}@example.com`,
    password: 'Password123!',
    displayName: `${faker.name.firstName()} ${faker.name.lastName()}`,
  };

  const loginDto: LoginDto = {
    username: signUpDto.email,
    password: signUpDto.password,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        ApiEventsModule,
        TypeOrmModule.forFeature([ApiEvent]),
        UsersModule,
      ],
    }).compile();

    app = getApp(moduleFixture);

    await app.init();

    await request(app.getHttpServer())
      .post('/auth/sign-up')
      .send(signUpDto)
      .expect(HttpStatus.CREATED);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Users - User creation', () => {
    let jwtToken: string;

    const newUserDto: SignUpDto = {
      email: `${v4()}@example.com`,
      password: 'Example123!',
      displayName: `${faker.name.firstName()} ${faker.name.lastName()}`,
      lname: faker.name.firstName(),
      fname: faker.name.lastName(),
    };

    beforeAll(async () => {
      jwtToken = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send(loginDto)
        .expect(HttpStatus.CREATED)
        .then((response: Response) => response.body.accessToken);
      Logger.debug(`jwtToken: ${jwtToken}`);
    });

    test('A user should not be able to create new users', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(newUserDto)
        .expect(HttpStatus.FORBIDDEN);
    });

    test('A user should not be able to create users using an email address already in use', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(newUserDto)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('Users - metadata', () => {
    let jwtToken: string;

    beforeAll(async () => {
      jwtToken = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send(loginDto)
        .expect(HttpStatus.CREATED)
        .then((response: Response) => response.body.accessToken);
    });

    test('A user should be able to read their own metadata', async () => {
      const results = await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.OK);

      expect(results);
    });

    test('A user should be able to update their own metadata', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(E2E_CONFIG.users.updated.bb())
        .expect(HttpStatus.OK);
    });
  });

  describe('Users - password updates which should fail', () => {
    let jwtToken: string;

    beforeAll(async () => {
      jwtToken = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send(loginDto)
        .expect(HttpStatus.CREATED)
        .then((response: Response) => response.body.accessToken);
    });

    test('A user should not be able to change their password as part of the user update lifecycle', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/users/me/')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          ...E2E_CONFIG.users.updated.bb(),
          password: 'newPassword123!!',
        })
        .expect(HttpStatus.FORBIDDEN);
    });

    test('A user should not be able to change their password if they provide an incorrect current password', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/users/me/password')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          currentPassword: faker.datatype.uuid(),
          newPassword: aNewPassword,
        })
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('Users - password updates which should succeed', () => {
    let jwtToken: string;

    beforeAll(async () => {
      jwtToken = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send(loginDto)
        .expect(HttpStatus.CREATED)
        .then((response: Response) => response.body.accessToken);
    });

    test('A user should be able to change their password if they provide the correct current password', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/users/me/password')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          currentPassword: loginDto.password,
          newPassword: aNewPassword,
        })
        .expect(HttpStatus.OK);
    });

    test('A user should be able to change their password if they provide the correct current password (take 2, back to initial password)', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/users/me/password')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          currentPassword: aNewPassword,
          newPassword: loginDto.password,
        })
        .expect(HttpStatus.OK);
    });
  });

  describe('Users - account deletion', () => {
    let jwtToken: string;

    beforeAll(async () => {
      jwtToken = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send(loginDto)
        .expect(HttpStatus.CREATED)
        .then((response: Response) => response.body.accessToken);
      Logger.debug(`jwtToken: ${jwtToken}`);
    });

    test('A user should be able to delete their own account', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/users/me')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.OK);
    });

    test('Once a user account is marked as deleted, the user should be logged out', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
