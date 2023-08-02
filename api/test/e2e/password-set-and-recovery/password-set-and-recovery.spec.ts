import ApplicationManager, {
  TestApplication,
} from '../../utils/application-manager';
import { DataSource } from 'typeorm';

import { clearTestDataFromDatabase } from '../../utils/database-test-helper';
import { HttpStatus } from '@nestjs/common';
import { createUser } from '../../entity-mocks';
import { User } from 'modules/users/user.entity';
import * as request from 'supertest';

import { AuthenticationService } from 'modules/authentication/authentication.service';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { setupTestUser } from '../../utils/userAuth';
import { ROLES } from 'modules/authorization/roles/roles.enum';

const mockEmailService = {
  sendMail: jest.fn(),
};

describe('Password recovery tests (e2e)', () => {
  let testApplication: TestApplication;
  let dataSource: DataSource;
  let authenticationService: AuthenticationService;
  let jwtToken: string;

  beforeAll(async () => {
    testApplication = await ApplicationManager.init(
      await Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideProvider('IEmailService')
        .useValue(mockEmailService),
    );
    ({ jwtToken } = await setupTestUser(testApplication));

    dataSource = testApplication.get<DataSource>(DataSource);

    authenticationService = testApplication.get<AuthenticationService>(
      AuthenticationService,
    );
  });

  afterAll(async () => {
    await clearTestDataFromDatabase(dataSource);
    await testApplication.close();
  });

  describe('User account activation (e2e)', () => {
    test('When a admin user creates a new user, a email should be sent, and the user should be able to create a first password with the token received', async () => {
      const email = 'activation@mail.com';
      const firstPassword = 'password';
      await request(testApplication.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ email, roles: [ROLES.ADMIN] })
        .expect(HttpStatus.CREATED);

      expect(mockEmailService.sendMail).toHaveBeenCalledTimes(1);

      const receivedToken = authenticationService.signToken(email);

      await request(testApplication.getHttpServer())
        .post(`/auth/validate-account`)
        .set('Authorization', `Bearer ${receivedToken}`)
        .send({ password: firstPassword })
        .expect(HttpStatus.CREATED);

      const newLoginUser = await request(testApplication.getHttpServer())
        .post('/auth/sign-in')
        .send({ username: email, password: firstPassword })
        .expect(HttpStatus.CREATED);

      expect(newLoginUser.body.accessToken).toBeDefined();
    });
  });

  describe('Password recovery request (e2e)', () => {
    test('When I request a password reset, but my user cannot be found, I should see an error message', async () => {
      const nonExistingUser = await request(testApplication.getHttpServer())
        .post('/api/v1/users/me/password/recover')
        .send({ email: 'nonexisting@email.com' })
        .expect(HttpStatus.NOT_FOUND);

      expect(nonExistingUser.body.errors[0].title).toEqual(
        `No user found with email address nonexisting@email.com`,
      );
    });
    test('When I request a password recovery, but my user is not active, I should see a error message', async () => {
      const user: User = await createUser({
        email: 'user@email.com',
        isActive: false,
      });

      const nonActiveUser = await request(testApplication.getHttpServer())
        .post('/api/v1/users/me/password/recover')
        .send({ email: `${user.email}` })
        .expect(HttpStatus.NOT_FOUND);

      expect(nonActiveUser.body.errors[0].title).toEqual(
        `No user found with email address ${user.email}`,
      );
    });
    test('When I request a password recovery, Then I should get a confirmation message', async () => {
      const user: User = await createUser({
        email: 'success@email.com',
        isActive: true,
      });
      const successfulAttempt = await request(testApplication.getHttpServer())
        .post('/api/v1/users/me/password/recover')
        .send({ email: `${user.email}` })
        .expect(HttpStatus.CREATED);

      expect(successfulAttempt.body.message).toEqual(
        `Recovery email sent to user with email: ${user.email}`,
      );
    });
  });
  describe('Password reset (e2e)', () => {
    test('When I try to reset my password, but a token has not been provided, I should see an error message', async () => {
      await request(testApplication.getHttpServer())
        .post('/api/v1/users/me/password/reset')
        .send({ newPassword: `test@mail.com` })
        .expect(HttpStatus.UNAUTHORIZED);
    });
    test('When I try to reset my password, but the token is invalid, I should see an error message', async () => {
      const token: string = authenticationService.signToken('fake@mail.com');
      await request(testApplication.getHttpServer())
        .post('/api/v1/users/me/password/reset')
        .set('Authorization', `Bearer ${token}`)
        .send({ newPassword: `aaa` })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    test('When I try to reset my password, but the token has expired, I should see a success message', async () => {
      const user: User = await createUser({
        email: 'expired@token.com',
        isActive: true,
      });
      const token: string = authenticationService.signToken(user.email, {
        expiresIn: '1ms',
      });
      await request(testApplication.getHttpServer())
        .post('/api/v1/users/me/password/reset')
        .set('Authorization', `Bearer ${token}`)
        .send({ newPassword: `aaa` })
        .expect(HttpStatus.UNAUTHORIZED);
    });
    test('When I try to reset my password, and the token is valid, Then I should be able to update my password', async () => {
      const user: User = await createUser({
        email: 'update@email.com',
        isActive: true,
      });
      const newPassword: string = 'Updated12!@';

      const token: string = authenticationService.signToken(user.email);
      const updatedPassWordUser = await request(testApplication.getHttpServer())
        .post('/api/v1/users/me/password/reset')
        .set('Authorization', `Bearer ${token}`)
        .send({ password: newPassword })
        .expect(HttpStatus.CREATED);
      expect(updatedPassWordUser.body.data.attributes.email).toEqual(
        user.email,
      );

      const newLoginUser = await request(testApplication.getHttpServer())
        .post('/auth/sign-in')
        .send({ username: user.email, password: newPassword })
        .expect(HttpStatus.CREATED);

      expect(newLoginUser.body.accessToken).toBeDefined();
    });
  });
});
