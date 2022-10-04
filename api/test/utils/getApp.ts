import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from '../../src/guards/jwt-auth.guard';
import { TestingModule } from '@nestjs/testing';

export function getApp(moduleFixture: TestingModule): INestApplication {
  const app = moduleFixture.createNestApplication();
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
