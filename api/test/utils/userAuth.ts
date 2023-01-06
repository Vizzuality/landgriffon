import { TestingModule } from '@nestjs/testing';
import { E2E_CONFIG } from '../e2e.config';
import { genSalt, hash } from 'bcrypt';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { User } from 'modules/users/user.entity';
import { EntityManager } from 'typeorm';

export async function saveUserAndGetTokenWithUserId(
  moduleFixture: TestingModule,
  app: INestApplication,
): Promise<{ jwtToken: string; userId: string }> {
  const salt = await genSalt();
  const entityManager = moduleFixture.get<EntityManager>(EntityManager);
  const userRepository = entityManager.getRepository(User);
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
