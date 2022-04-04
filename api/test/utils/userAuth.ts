import { TestingModule } from '@nestjs/testing';
import { E2E_CONFIG } from '../e2e.config';
import { genSalt, hash } from 'bcrypt';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { UserRepository } from '../../src/modules/users/user.repository';

export async function saveUserAndGetToken(
  moduleFixture: TestingModule,
  app: INestApplication,
): Promise<string> {
  const tokenWithUser = await saveUserAndGetTokenWithUserId(moduleFixture, app);
  return tokenWithUser.jwtToken;
}

export async function saveUserAndGetTokenWithUserId(
  moduleFixture: TestingModule,
  app: INestApplication,
): Promise<{ jwtToken: string; userId: string }> {
  const salt = await genSalt();
  const userRepository = moduleFixture.get<UserRepository>(UserRepository);
  await userRepository.save({
    ...E2E_CONFIG.users.signUp,
    salt,
    password: await hash(E2E_CONFIG.users.signUp.password, salt),
    isActive: true,
    isDeleted: false,
  });
  const response = await request(app.getHttpServer())
    .post('/auth/sign-in')
    .send(E2E_CONFIG.users.signIn);
  return { jwtToken: response.body.accessToken, userId: response.body.user.id };
}
