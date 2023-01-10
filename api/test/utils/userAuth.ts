import { E2E_CONFIG } from '../e2e.config';
import { genSalt, hash } from 'bcrypt';
import * as request from 'supertest';
import { User } from 'modules/users/user.entity';
import { EntityManager } from 'typeorm';
import { TestApplication } from './application-manager';

export async function saveUserAndGetTokenWithUserId(
  applicationManager: TestApplication,
): Promise<{ jwtToken: string; userId: string }> {
  const salt = await genSalt();
  const entityManager = applicationManager.get<EntityManager>(EntityManager);
  const userRepository = entityManager.getRepository(User);
  await userRepository.save({
    ...E2E_CONFIG.users.signUp,
    salt,
    password: await hash(E2E_CONFIG.users.signUp.password, salt),
    isActive: true,
    isDeleted: false,
  });
  const response = await request(applicationManager.application.getHttpServer())
    .post('/auth/sign-in')
    .send(E2E_CONFIG.users.signIn);

  return { jwtToken: response.body.accessToken, userId: response.body.user.id };
}
