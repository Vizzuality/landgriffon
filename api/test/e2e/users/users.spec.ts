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
import {
  createScenario,
  createScenarioIntervention,
  createSourcingLocation,
  createSourcingRecord,
  createUser,
} from '../../entity-mocks';
import { Scenario } from '../../../src/modules/scenarios/scenario.entity';
import { ScenarioIntervention } from '../../../src/modules/scenario-interventions/scenario-intervention.entity';
import {
  SOURCING_LOCATION_TYPE_BY_INTERVENTION,
  SourcingLocation,
} from '../../../src/modules/sourcing-locations/sourcing-location.entity';
import { SourcingRecord } from '../../../src/modules/sourcing-records/sourcing-record.entity';
import { PERMISSIONS } from 'modules/authorization/permissions/permissions.enum';

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
      roles: [ROLES.USER],
    };
    afterEach(async () => {
      await userRepository.delete({ email: newUserDto.email });
    });

    test('A user should not be able to create new users', async () => {
      await request(testApplication.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${userTestUser.jwtToken}`)
        .send(newUserDto)
        .expect(HttpStatus.FORBIDDEN);
    });

    test('A admin user should not be able to create a user without any role', async () => {
      const { password, roles, ...newUserDtoWithoutPasswordAndWithoutRoles } =
        newUserDto;
      const res = await request(testApplication.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminTestUser.jwtToken}`)
        .send(newUserDtoWithoutPasswordAndWithoutRoles);

      expect(res).toHaveErrorMessage(
        HttpStatus.BAD_REQUEST,
        'Bad Request Exception',
        [
          'each value in roles must be one of the following values: admin, user',
          'roles must contain at least 1 elements',
        ],
      );
    });

    test('A admin user should be able to create a user without a password', async () => {
      const { password, ...newUserWithoutPassword } = newUserDto;
      await request(testApplication.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminTestUser.jwtToken}`)
        .send({ ...newUserWithoutPassword })
        .expect(HttpStatus.CREATED);
    });

    test('When a admin creates a user this user should be active by default', async () => {
      await request(testApplication.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminTestUser.jwtToken}`)
        .send(newUserDto)
        .expect(HttpStatus.CREATED);

      const user = await userRepository.findByEmail(newUserDto.email);
      expect(user?.isActive).toBe(true);
    });

    test('A admin should not be able to create a user without providing any role', async () => {
      await request(testApplication.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminTestUser.jwtToken}`)
        .send({ email: 'test@test.com', password: '12345678' })
        .expect(HttpStatus.BAD_REQUEST);
    });

    test('A admin user should be able to create a user with roles ', async () => {
      await request(testApplication.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminTestUser.jwtToken}`)
        .send({
          email: 'test@test.com',
          password: '12345678',
          roles: [ROLES.ADMIN, ROLES.USER],
        })
        .expect(HttpStatus.CREATED);

      const user = await userRepository.findByEmail('test@test.com');
      expect(user).toBeTruthy();
      expect(user?.email).toEqual('test@test.com');
      expect(user?.roles).toEqual([
        { name: ROLES.ADMIN, permissions: [] },
        {
          name: ROLES.USER,
          permissions: [
            {
              action: PERMISSIONS.CAN_CREATE_SCENARIO,
            },
            {
              action: PERMISSIONS.CAN_EDIT_SCENARIO,
            },
            {
              action: PERMISSIONS.CAN_DELETE_SCENARIO,
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
      const { id: userId } = await createUser({ email: 'whatthefuck' });

      const response = await request(testApplication.getHttpServer())
        .patch(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${adminTestUser.jwtToken}`)
        .send({
          roles: [ROLES.ADMIN, ROLES.USER],
        })
        .expect(HttpStatus.OK);
      expect(response.body.data.id).toEqual(userId);
      expect(response.body.data.attributes.roles).toEqual([
        { name: ROLES.ADMIN, permissions: [] },
        {
          name: ROLES.USER,
          permissions: [
            {
              action: PERMISSIONS.CAN_CREATE_SCENARIO,
            },
            {
              action: PERMISSIONS.CAN_EDIT_SCENARIO,
            },
            {
              action: PERMISSIONS.CAN_DELETE_SCENARIO,
            },
          ],
        },
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
    test('A user should be able to soft delete their own account', async () => {
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

    test('A user with no admin role should not be able to delete any user', async () => {
      await request(testApplication.getHttpServer())
        .delete(`/api/v1/users/${adminTestUser.user.id}`)
        .set('Authorization', `Bearer ${userTestUser.jwtToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });

    test('A user with admin role should be able to delete a user, and all scenarios and interventions of the user should be gone as well', async () => {
      const randomUser = await createUser({ email: 'test1@mail.com' });
      const newAdminUser = await setupTestUser(testApplication, ROLES.ADMIN, {
        email: 'newadmin@test.com',
      });
      for (const number of [1, 2, 3, 4, 5]) {
        const scenario: Scenario = await createScenario({
          userId: randomUser.id,
        });
        const scenarioIntervention: ScenarioIntervention =
          await createScenarioIntervention({ scenario });

        const sourcingLocation: SourcingLocation = await createSourcingLocation(
          {
            scenarioInterventionId: scenarioIntervention.id,
            interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
          },
        );

        await createSourcingRecord({ sourcingLocationId: sourcingLocation.id });
      }
      await request(testApplication.getHttpServer())
        .delete(`/api/v1/users/${randomUser.id}`)
        .set('Authorization', `Bearer ${newAdminUser.jwtToken}`);

      const scenarios = await dataSource.getRepository(Scenario).find();
      const interventions = await dataSource
        .getRepository(ScenarioIntervention)
        .find();
      const sourcingLocations = await dataSource
        .getRepository(SourcingLocation)
        .find();
      const sourcingRecords = await dataSource
        .getRepository(SourcingRecord)
        .find();

      [scenarios, interventions, sourcingLocations, sourcingRecords].forEach(
        (entityArray: any[]) => expect(entityArray).toHaveLength(0),
      );
    });
  });
});
