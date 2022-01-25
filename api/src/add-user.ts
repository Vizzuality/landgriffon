import { NestFactory } from '@nestjs/core';
import { AppModule } from 'app.module';
import { AuthenticationService } from 'modules/authentication/authentication.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const email: string = process.argv[2];
  const password: string = process.argv[3];

  const newUserService = app.get(AuthenticationService);
  await newUserService.createUser({
    email,
    password,
  });

  await app.close();
}
bootstrap();
