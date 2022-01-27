import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'app.module';
import { E2E_CONFIG } from '../../e2e.config';
import { User } from 'modules/users/user.entity';
import * as bcrypt from 'bcrypt';
import { UserRepository } from 'modules/users/user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from 'typeorm.config';
import { UsersModule } from 'modules/users/users.module';
import { ApiEventByTopicAndKind } from '../../../src/modules/api-events/api-event.topic+kind.entity';
import { API_EVENT_KINDS } from '../../../src/modules/api-events/api-event.entity';
import { SignUpDto } from '../../../src/modules/authentication/dto/sign-up.dto';
import { v4 } from 'uuid';
import faker from 'faker';

jest.mock('config', () => {
  const config = jest.requireActual('config');

  const configGet = config.get;

  config.get = function (key: string): any {
    switch (key) {
      case 'auth.password.minLength':
        return 8;
      case 'auth.password.includeNumerics':
        return true;
      case 'auth.password.includeUpperCase':
        return true;
      case 'auth.password.includeSpecialCharacters':
        return true;
      default:
        return configGet.call(config, key);
    }
  };
  return config;
});

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let userRepository: UserRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        TypeOrmModule.forRoot(typeOrmConfig),
        UsersModule,
        TypeOrmModule.forFeature([UserRepository]),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    userRepository = moduleFixture.get<UserRepository>(UserRepository);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication', () => {
    beforeAll(async (): Promise<User> => {
      const user: User = new User();
      user.email = E2E_CONFIG.users.basic.aa.username;
      user.fname = 'a';
      user.lname = 'a';
      user.displayName = 'User A A';
      user.salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(
        E2E_CONFIG.users.basic.aa.password,
        user.salt,
      );
      user.isActive = true;
      return user.save();
    });

    it('Fails to sign up user with password without upper case character', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send({
          email: E2E_CONFIG.users.signUp.email,
          password: 'no1uppercase1!',
        })
        .expect(HttpStatus.BAD_REQUEST);
      expect(response).toHaveErrorMessage(
        HttpStatus.BAD_REQUEST,
        'Bad Request Exception',
        ['Password must contain at least 1 upper case letter'],
      );
    });

    it('Fails to sign up user with password without numeric', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send({
          email: E2E_CONFIG.users.signUp.email,
          password: 'noNumeric!',
        })
        .expect(HttpStatus.BAD_REQUEST);
      expect(response).toHaveErrorMessage(
        HttpStatus.BAD_REQUEST,
        'Bad Request Exception',
        ['Password must contain at least 1 numeric character'],
      );
    });

    it('Fails to sign up user with password without special character', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send({
          email: E2E_CONFIG.users.signUp.email,
          password: 'noSpecial123',
        })
        .expect(HttpStatus.BAD_REQUEST);
      expect(response).toHaveErrorMessage(
        HttpStatus.BAD_REQUEST,
        'Bad Request Exception',
        ['Password must contain at least 1 special character (!@#$%^&*)'],
      );
    });

    it('Fails to sign up user with short password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send({
          email: E2E_CONFIG.users.signUp.email,
          password: 'Short1!',
        })
        .expect(HttpStatus.BAD_REQUEST);
      expect(response).toHaveErrorMessage(
        HttpStatus.BAD_REQUEST,
        'Bad Request Exception',
        ['Password too short, minimal length is 8'],
      );
    });

    it('Fails to sign up user with invalid password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send({
          email: E2E_CONFIG.users.signUp.email,
          password: 'bad',
        })
        .expect(HttpStatus.BAD_REQUEST);
      expect(response).toHaveErrorMessage(
        HttpStatus.BAD_REQUEST,
        'Bad Request Exception',
        [
          'Password too short, minimal length is 8. ' +
            'Password must contain at least 1 upper case letter. ' +
            'Password must contain at least 1 numeric character. ' +
            'Password must contain at least 1 special character (!@#$%^&*)',
        ],
      );
    });

    it('Signs up user with valid password', async () => {
      await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send({
          email: E2E_CONFIG.users.signUp.email,
          password: E2E_CONFIG.users.signUp.password,
        })
        .expect(HttpStatus.CREATED);
    });

    it('Retrieves a JWT token when authenticating with valid credentials', async () => {
      await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({
          username: E2E_CONFIG.users.basic.aa.username,
          password: E2E_CONFIG.users.basic.aa.password,
        })
        .expect(HttpStatus.CREATED);
    });

    it('Fails to authenticate a user with an incorrect password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({ email: E2E_CONFIG.users.basic.aa.username, password: 'wrong' })
        .expect(401);

      expect(response.body.accessToken).not.toBeDefined();
    });

    it('Fails to authenticate a non-existing user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({ email: 'test@example.com', password: 'wrong' })
        .expect(401);

      expect(response.body.accessToken).not.toBeDefined();
    });

    afterAll(async () => {
      return userRepository.delete({});
    });
  });
});
