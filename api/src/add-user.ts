import { INestApplicationContext, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'app.module';
import { validate } from 'class-validator';
import { AuthenticationService } from 'modules/authentication/authentication.service';
import { SignUpDto } from 'modules/authentication/dto/sign-up.dto';
import { User } from 'modules/users/user.entity';

async function bootstrap(): Promise<void> {
  const logger: Logger = new Logger('user-cli');
  const app: INestApplicationContext =
    await NestFactory.createApplicationContext(AppModule);

  const newUserService: AuthenticationService = app.get(AuthenticationService);

  const newUser: SignUpDto = new SignUpDto();
  newUser.email = process.argv[2];
  newUser.password = process.argv[3];

  validate(newUser).then((errors: any) => {
    if (errors.length > 0) {
      logger.error(errors);
      process.exit(1);
    }
  });

  const createdUser: Partial<User> = await newUserService.createUser(newUser);
  logger.log(`User with email ${createdUser.email} created`);

  await app.close();
  process.exit(0);
}

bootstrap();
