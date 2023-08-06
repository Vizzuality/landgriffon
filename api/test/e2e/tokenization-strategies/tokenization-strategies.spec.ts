import ApplicationManager, {
  TestApplication,
} from '../../utils/application-manager';
import {
  AuthenticationService,
  TOKEN_TYPE,
} from '../../../src/modules/authentication/authentication.service';
import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';

describe('Password recovery tests (e2e)', () => {
  let testApplication: TestApplication;
  let authenticationService: AuthenticationService;

  beforeAll(async () => {
    testApplication = await ApplicationManager.init();
    authenticationService = testApplication.get<AuthenticationService>(
      AuthenticationService,
    );
  });

  afterAll(async () => {
    await testApplication.close();
  });

  describe('Tokenization strategies tests (e2e)', () => {
    test(
      'Given I have a account activation token,' +
        'But I use it to reset the password,' +
        ' Then I should not be authorized',
      async () => {
        const accountActivationToken: string = authenticationService.signToken(
          'fake@mail.com',
          { tokenType: TOKEN_TYPE.ACCOUNT_ACTIVATION },
        );

        await request(testApplication.getHttpServer())
          .post('/api/v1/users/me/password/reset')
          .set('Authorization', `Bearer ${accountActivationToken}`)
          .send({ newPassword: `test@mail.com` })
          .expect(HttpStatus.UNAUTHORIZED);
      },
    );
    test(
      'Given I have a password reset token,' +
        'But I use it to activate my account,' +
        ' Then I should not be authorized',
      async () => {
        const passwordResetToken: string = authenticationService.signToken(
          'fake@mail.com',
          { tokenType: TOKEN_TYPE.PASSWORD_RESET },
        );

        await request(testApplication.getHttpServer())
          .post('/auth/validate-account')
          .set('Authorization', `Bearer ${passwordResetToken}`)
          .send({ newPassword: `test@mail.com` })
          .expect(HttpStatus.UNAUTHORIZED);
      },
    );
    test(
      'Given I have a login token,' +
        'But I use it to activate my account, And to reset my password' +
        ' Then I should not be authorized',
      async () => {
        const loginToken: string = authenticationService.signToken(
          'fake@mail.com',
          { tokenType: TOKEN_TYPE.GENERAL },
        );

        await request(testApplication.getHttpServer())
          .post('/auth/validate-account')
          .set('Authorization', `Bearer ${loginToken}`)
          .send({ newPassword: `test@mail.com` })
          .expect(HttpStatus.UNAUTHORIZED);

        await request(testApplication.getHttpServer())
          .post('/api/v1/users/me/password/reset')
          .set('Authorization', `Bearer ${loginToken}`)
          .send({ newPassword: `test@mail.com` })
          .expect(HttpStatus.UNAUTHORIZED);
      },
    );
    test(
      'Given I have a account activation token, or a password reset token' +
        'When I use it to get data from the API' +
        ' Then I should not be authorized',
      async () => {
        const accountActivationToken: string = authenticationService.signToken(
          'fake@mail.com',
          { tokenType: TOKEN_TYPE.ACCOUNT_ACTIVATION },
        );

        const passwordResetToken: string = authenticationService.signToken(
          'fake@mail.com',
          { tokenType: TOKEN_TYPE.PASSWORD_RESET },
        );

        await request(testApplication.getHttpServer())
          .get('/api/v1/materials')
          .set('Authorization', `Bearer ${accountActivationToken}`)
          .send({ newPassword: `test@mail.com` })
          .expect(HttpStatus.UNAUTHORIZED);

        await request(testApplication.getHttpServer())
          .get('/api/v1/materials')
          .set('Authorization', `Bearer ${passwordResetToken}`)
          .send({ newPassword: `test@mail.com` })
          .expect(HttpStatus.UNAUTHORIZED);
      },
    );
  });
});
