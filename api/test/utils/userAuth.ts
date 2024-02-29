import { E2E_CONFIG } from '../e2e.config';
import { genSalt, hash } from 'bcrypt';
import * as request from 'supertest';
import { Role } from 'modules/authorization/roles/role.entity';
import { ROLES } from 'modules/authorization/roles/roles.enum';
import { User } from 'modules/users/user.entity';
import { EntityManager } from 'typeorm';
import { TestApplication } from './application-manager';
import { Permission } from '../../src/modules/authorization/permissions/permissions.entity';
import { PERMISSIONS } from '../../src/modules/authorization/permissions/permissions.enum';

export type TestUser = { jwtToken: string; user: User; password: string };

export async function setupTestUser(
  applicationManager: TestApplication,
  roleName: ROLES = ROLES.ADMIN,
  extraData: Partial<User> = { password: 'Password123!' },
): Promise<TestUser> {
  const salt = await genSalt();
  const role = new Role();
  role.name = roleName;
  const entityManager = applicationManager.get<EntityManager>(EntityManager);
  const userRepository = entityManager.getRepository(User);

  const { password, ...restOfExtraData } = extraData;

  await setUpRolesAndPermissions(entityManager);

  let existingUser = await userRepository.findOne({
    where: { email: E2E_CONFIG.users.signUp.email },
  });
  if (!existingUser) {
    existingUser = await userRepository.save({
      ...E2E_CONFIG.users.signUp,
      salt,
      password: await hash(password!, salt),
      isActive: true,
      isDeleted: false,
      roles: [role],
    });
  }

  const response = await request(applicationManager.application.getHttpServer())
    .post('/auth/sign-in')
    .send({ username: existingUser.email, password: password });

  return {
    jwtToken: response.body.accessToken,
    user: existingUser,
    password: password!,
  };
}

async function setUpRolesAndPermissions(
  entityManager: EntityManager,
): Promise<any> {
  const permissions: Permission[] = Object.values(PERMISSIONS).map(
    (permission: PERMISSIONS) =>
      ({
        action: permission,
      } as Permission),
  );

  const roles: Role[] = Object.values(ROLES).map(
    (role: ROLES) =>
      ({
        name: role,
      } as Role),
  );
  await entityManager.getRepository(Permission).save(permissions);
  await entityManager.getRepository(Role).save(roles);
}
