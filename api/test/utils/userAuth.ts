import { E2E_CONFIG } from '../e2e.config';
import { genSalt, hash } from 'bcrypt';
import * as request from 'supertest';
import { Role } from 'modules/authorization/roles/role.entity';
import { ROLES } from 'modules/authorization/roles/roles.enum';
import { User } from 'modules/users/user.entity';
import { EntityManager } from 'typeorm';
import { TestApplication } from './application-manager';
import { faker } from '@faker-js/faker';

export type TestUser = { jwtToken: string; user: User; password: string };

export async function setupTestUser(
  applicationManager: TestApplication,
  roleName: ROLES = ROLES.ADMIN,
  extraData: Partial<User> = {},
): Promise<TestUser> {
  const salt = await genSalt();
  const role = new Role();
  role.name = roleName;
  const entityManager = applicationManager.get<EntityManager>(EntityManager);
  const userRepository = entityManager.getRepository(User);

  const { password: extraDataPassword, ...restOfExtraData } = extraData;

  const password = extraDataPassword ?? faker.internet.password();

  const user = await userRepository.save({
    ...E2E_CONFIG.users.signUp,
    salt,
    password: await hash(password, salt),
    isActive: true,
    isDeleted: false,
    roles: [role],
    ...restOfExtraData,
  });
  const response = await request(applicationManager.application.getHttpServer())
    .post('/auth/sign-in')
    .send({ username: user.email, password: password });

  return { jwtToken: response.body.accessToken, user, password };
}
