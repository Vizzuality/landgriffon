import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { Test, TestingModule } from '@nestjs/testing';
import { useContainer } from 'class-validator';
import { AppModule } from '../../src/app.module';
import * as config from 'config';

export function getApp(moduleFixture: TestingModule): INestApplication {
  const serverConfig: any = config.get('server');
  const app = moduleFixture.createNestApplication({
    logger: serverConfig.loggerLevel,
  });
  useContainer(app, { fallbackOnErrors: true });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const reflector: Reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  return app;
}

export default class AppSingleton {
  static moduleFixture: TestingModule;
  static app: INestApplication;

  static async init(): Promise<{
    moduleFixture: TestingModule;
    app: INestApplication;
  }> {
    AppSingleton.moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const serverConfig: any = config.get('server');
    AppSingleton.app = AppSingleton.moduleFixture.createNestApplication({
      logger: serverConfig.loggerLevel,
    });
    useContainer(AppSingleton.app, { fallbackOnErrors: true });
    AppSingleton.app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    const reflector: Reflector = AppSingleton.app.get(Reflector);
    AppSingleton.app.useGlobalGuards(new JwtAuthGuard(reflector));

    await AppSingleton.app.init();

    return { moduleFixture: AppSingleton.moduleFixture, app: AppSingleton.app };
  }
}
