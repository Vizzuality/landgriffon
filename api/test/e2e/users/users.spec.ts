import { Test, TestingModule } from '@nestjs/testing';
import {
  HttpStatus,
  INestApplication,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import * as faker from 'faker';
import * as request from 'supertest';
import { Response } from 'supertest';
import { AppModule } from 'app.module';
import { E2E_CONFIG } from '../../e2e.config';
import { v4 } from 'uuid';
import { SignUpDto } from 'modules/authentication/dto/sign-up.dto';
import { User } from 'modules/users/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { API_EVENT_KINDS, ApiEvent } from 'modules/api-events/api-event.entity';
import { ApiEventsModule } from 'modules/api-events/api-events.module';
import { ApiEventsService } from 'modules/api-events/api-events.service';
import { UsersModule } from 'modules/users/users.module';
import { LoginDto } from 'modules/authentication/dto/login.dto';
import { ApiEventByTopicAndKind } from 'modules/api-events/api-event.topic+kind.entity';
import { UserRepository } from 'modules/users/user.repository';

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
  let apiEventsService: ApiEventsService;
  let userRepository: UserRepository;

  const aNewPassword = faker.datatype.uuid();

  const signUpDto: SignUpDto = {
    email: `${v4()}@example.com`,
    password: v4(),
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

    apiEventsService = moduleFixture.get<ApiEventsService>(ApiEventsService);
    userRepository = moduleFixture.get<UserRepository>(UserRepository);

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

  afterAll(async () => {
    await app.close();
  });

  describe('Users - sign up and validation', () => {
    let newUser: User | undefined;
    let validationTokenEvent: ApiEventByTopicAndKind | undefined;

    test('A user should be able to create an account using an email address not currently in use', async () => {
      await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send(signUpDto)
        .expect(HttpStatus.CREATED);
    });

    test('A user should not be able to create an account using an email address already in use', async () => {
      /**
       * We should handle this explicitly in the API - until then, this should
       * throw a 500 error.
       */
      await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send(signUpDto)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    test('A user should not be able to log in until their account has been validated', async () => {
      const user: User | undefined = await userRepository.findByEmail(
        signUpDto.email,
      );
      if (!user) {
        throw new Error('Could not find user to validate');
      }
      user.isActive = false;
      await user.save();

      await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send(loginDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    test('A user should be able to validate their account (within the validity timeframe of the validationToken)', async () => {
      /**
       * Here we need to dig into the actual database to retrieve both the id
       * assigned to the user when their account is created, and the one-time
       * token that they would normally receive via email as part of the account
       * validation/email confirmation workflow.
       */
      newUser = await userRepository.findByEmail(signUpDto.email);
      expect(newUser).toBeDefined();

      if (!newUser) {
        throw new Error('Cannot retrieve data for newly created user.');
      }

      validationTokenEvent = await apiEventsService.getLatestEventForTopic({
        topic: newUser.id,
        kind: API_EVENT_KINDS.user__accountActivationTokenGenerated__v1alpha1,
      });

      await request(app.getHttpServer())
        .get(
          `/auth/validate-account/${newUser.id}/${validationTokenEvent?.data?.validationToken}`,
        )
        .expect(HttpStatus.OK);
    });

    test('A user account validation token should not be allowed to be spent more than once', async () => {
      if (!newUser) {
        throw new Error('Cannot retrieve data for newly created user.');
      }

      await request(app.getHttpServer())
        .get(
          `/auth/validate-account/${newUser.id}/${validationTokenEvent?.data?.validationToken}`,
        )
        .expect(HttpStatus.NOT_FOUND);
    });

    test('A user should be able to log in once their account has been validated', async () => {
      await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send(loginDto)
        .expect(HttpStatus.CREATED);
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
          password: faker.random.alphaNumeric(),
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

    test('Once a user account is marked as deleted, the user should not be able to log back in', async () => {
      await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send(loginDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('Users - Sign up again', () => {
    let newUser: User | undefined;
    let validationTokenEvent: ApiEventByTopicAndKind | undefined;

    test('A user should be able to sign up using the same email address as that of an account that has been deleted', async () => {
      await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send(signUpDto)
        .expect(HttpStatus.CREATED);
    });

    test('A user should be able to validate their account (within the validity timeframe of the validationToken)', async () => {
      /**
       * Here we need to dig into the actual database to retrieve both the id
       * assigned to the user when their account is created, and the one-time
       * token that they would normally receive via email as part of the account
       * validation/email confirmation workflow.
       */
      newUser = await userRepository.findByEmail(signUpDto.email);
      expect(newUser).toBeDefined();

      if (!newUser) {
        throw new Error('Cannot retrieve data for newly created user.');
      }

      validationTokenEvent = await apiEventsService.getLatestEventForTopic({
        topic: newUser.id,
        kind: API_EVENT_KINDS.user__accountActivationTokenGenerated__v1alpha1,
      });

      await request(app.getHttpServer())
        .get(
          `/auth/validate-account/${newUser.id}/${validationTokenEvent?.data?.validationToken}`,
        )
        .expect(HttpStatus.OK);
    });

    test('A user should be able to log in once their account has been validated', async () => {
      await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send(loginDto)
        .expect(HttpStatus.CREATED);
    });
  });
});
