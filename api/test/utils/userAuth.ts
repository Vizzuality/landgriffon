import { TestingModule } from '@nestjs/testing';
import { E2E_CONFIG } from '../e2e.config';
import { genSalt, hash } from 'bcrypt';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { UserRepository } from '../../src/modules/users/user.repository';
import { Role } from '../../src/modules/authorization/role.entity';
import { ROLES } from '../../src/modules/authorization/roles/roles.enum';

export async function saveAdminAndGetToken(
  moduleFixture: TestingModule,
  app: INestApplication,
): Promise<string> {
  const tokenWithUser = await saveUserWithRoleAndGetTokenWithUserId(
    moduleFixture,
    app,
    ROLES.ADMIN,
  );
  return tokenWithUser.jwtToken;
}

export async function saveUserWithRoleAndGetTokenWithUserId(
  moduleFixture: TestingModule,
  app: INestApplication,
  role: ROLES = ROLES.ADMIN,
): Promise<{ jwtToken: string; userId: string }> {
  const salt = await genSalt();
  const roleForUser = new Role();
  roleForUser.name = role;
  const userRepository = moduleFixture.get<UserRepository>(UserRepository);
  await userRepository.save({
    ...E2E_CONFIG.users.signUp,
    salt,
    password: await hash(E2E_CONFIG.users.signUp.password, salt),
    isActive: true,
    isDeleted: false,
    roles: [roleForUser],
  });
  const response = await request(app.getHttpServer())
    .post('/auth/sign-in')
    .send(E2E_CONFIG.users.signIn);
  return { jwtToken: response.body.accessToken, userId: response.body.user.id };
}
