import { HttpStatus } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import * as request from 'supertest';
import { E2E_CONFIG } from '../../e2e.config';
import { v4 } from 'uuid';
import { SignUpDto } from 'modules/authentication/dto/sign-up.dto';
import { setupTestUser, TestUser } from '../../utils/userAuth';
import { ROLES } from 'modules/authorization/roles/roles.enum';
import ApplicationManager, {
  TestApplication,
} from '../../utils/application-manager';
import { DataSource } from 'typeorm';
import { clearTestDataFromDatabase } from '../../utils/database-test-helper';
import { UserRepository } from 'modules/users/user.repository';
import { createUser } from '../../entity-mocks';

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
  let adminTestUser: TestUser;
  let userTestUser: TestUser;
  let testApplication: TestApplication;
  let dataSource: DataSource;
  let userRepository: UserRepository;

  beforeAll(async () => {
    testApplication = await ApplicationManager.init();

    adminTestUser = await setupTestUser(testApplication);
    userTestUser = await setupTestUser(testApplication, ROLES.USER, {
      email: 'user@example.com',
    });

    dataSource = testApplication.get<DataSource>(DataSource);
    userRepository = testApplication.get<UserRepository>(UserRepository);
  });

  afterAll(async () => {
    await clearTestDataFromDatabase(dataSource);
    await testApplication.close();
  });

  describe('Users - User creation', () => {
    const newUserDto: SignUpDto = {
      email: `${v4()}@example.com`,
      password: 'Example123!',
      displayName: `${faker.name.firstName()} ${faker.name.lastName()}`,
      lname: faker.name.firstName(),
      fname: faker.name.lastName(),
    };

    test('A user should not be able to create new users', async () => {
      await request(testApplication.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${userTestUser.jwtToken}`)
        .send(newUserDto)
        .expect(HttpStatus.FORBIDDEN);
    });

    test('A admin should be able to create a user with default user role if none provided ', async () => {
      const response = await request(testApplication.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminTestUser.jwtToken}`)
        .send({ email: 'test@test.com', password: '12345678' })
        .expect(HttpStatus.CREATED);

      expect(response.body.data.attributes.email).toEqual('test@test.com');
      expect(response.body.data.attributes.roles).toEqual([
        {
          name: ROLES.USER,
          permissions: [
            {
              action: 'canCreateScenario',
            },
            {
              action: 'canEditScenario',
            },
            {
              action: 'canDeleteScenario',
            },
          ],
        },
      ]);

      await userRepository.delete({ email: 'test@test.com' });
    });

    test('A admin user should be able to create a user with roles ', async () => {
      const response = await request(testApplication.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminTestUser.jwtToken}`)
        .send({
          email: 'test@test.com',
          password: '12345678',
          roles: [ROLES.ADMIN, ROLES.USER],
        })
        .expect(HttpStatus.CREATED);

      expect(response.body.data.attributes.email).toEqual('test@test.com');
      expect(response.body.data.attributes.roles).toEqual([
        { name: ROLES.ADMIN, permissions: [] },
        {
          name: ROLES.USER,
          permissions: [
            {
              action: 'canCreateScenario',
            },
            {
              action: 'canEditScenario',
            },
            {
              action: 'canDeleteScenario',
            },
          ],
        },
      ]);

      await userRepository.delete({ email: 'test@test.com' });
    });

    test('A user should not be able to update its own role ', async () => {
      const response = await request(testApplication.getHttpServer())
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${adminTestUser.jwtToken}`)
        .send({
          email: newUserDto.email,
          roles: [ROLES.ADMIN, ROLES.USER],
        })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.errors[0].meta.rawError.response.message[0]).toEqual(
        'property roles should not exist',
      );
    });

    test('A admin should be able to update any users role', async () => {
      const { id: userId } = await createUser();

      const response = await request(testApplication.getHttpServer())
        .patch(`/api/v1/users/update/${userId}`)
        .set('Authorization', `Bearer ${adminTestUser.jwtToken}`)
        .send({
          roles: [ROLES.ADMIN, ROLES.USER],
        })
        .expect(HttpStatus.OK);

      // TODO: nestjs-base-service transforms role property from array of objects to array of strings. decide approach for everything (post, patch...) and be consistent
      expect(response.body.data.attributes.roles).toEqual([
        ROLES.ADMIN,
        ROLES.USER,
      ]);
    });

    test('A user should not be able to create users using an email address already in use', async () => {
      await request(testApplication.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${userTestUser.jwtToken}`)
        .send(newUserDto)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('Users - metadata', () => {
    test('A user should be able to read their own metadata', async () => {
      const results = await request(testApplication.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${adminTestUser.jwtToken}`)
        .expect(HttpStatus.OK);

      expect(results);
    });

    test('A user should be able to update their own metadata', async () => {
      await request(testApplication.getHttpServer())
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${adminTestUser.jwtToken}`)
        .send(E2E_CONFIG.users.updated.bb())
        .expect(HttpStatus.OK);
    });
  });

  describe('Users - password updates which should fail', () => {
    test('A user should not be able to change their password as part of the user update lifecycle', async () => {
      await request(testApplication.getHttpServer())
        .patch('/api/v1/users/me/')
        .set('Authorization', `Bearer ${adminTestUser.jwtToken}`)
        .send({
          ...E2E_CONFIG.users.updated.bb(),
          password: 'newPassword123!!',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    test('A user should not be able to change their password if they provide an incorrect current password', async () => {
      await request(testApplication.getHttpServer())
        .patch('/api/v1/users/me/password')
        .set('Authorization', `Bearer ${adminTestUser.jwtToken}`)
        .send({
          currentPassword: faker.datatype.uuid(),
          newPassword: faker.internet.password(),
        })
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('Users - password updates which should succeed', () => {
    const newPassword = faker.internet.password();

    test('A user should be able to change their password if they provide the correct current password', async () => {
      await request(testApplication.getHttpServer())
        .patch('/api/v1/users/me/password')
        .set('Authorization', `Bearer ${userTestUser.jwtToken}`)
        .send({
          currentPassword: userTestUser.password,
          newPassword: newPassword,
        })
        .expect(HttpStatus.OK);
    });

    test('A user should be able to change their password if they provide the correct current password (take 2, back to initial password)', async () => {
      await request(testApplication.getHttpServer())
        .patch('/api/v1/users/me/password')
        .set('Authorization', `Bearer ${userTestUser.jwtToken}`)
        .send({
          currentPassword: newPassword,
          newPassword: userTestUser.password,
        })
        .expect(HttpStatus.OK);
    });
  });

  describe('Users - account deletion', () => {
    test('A user should be able to delete their own account', async () => {
      await request(testApplication.getHttpServer())
        .delete('/api/v1/users/me')
        .set('Authorization', `Bearer ${adminTestUser.jwtToken}`)
        .expect(HttpStatus.OK);
    });

    test('Once a user account is marked as deleted, the user should be logged out', async () => {
      await request(testApplication.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${adminTestUser.jwtToken}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
