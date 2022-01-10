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
