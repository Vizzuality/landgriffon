import { NestFactory, Reflector } from '@nestjs/core';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from 'app.module';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import * as config from 'config';
import * as helmet from 'helmet';
import * as compression from 'compression';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { useContainer } from 'class-validator';
import { SensitiveInfoGuard } from 'guards/sensitive-info.guard';

// test

async function bootstrap(): Promise<void> {
  const logger: Logger = new Logger('bootstrap');
  const serverConfig: any = config.get('server');
  const app: INestApplication = await NestFactory.create(AppModule, {
    logger: serverConfig.loggerLevel,
  });
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.use(helmet());
  app.enableCors();
  app.use(compression());

  const swaggerOptions: Omit<OpenAPIObject, 'components' | 'paths'> =
    new DocumentBuilder()
      .setTitle('LandGriffon API')
      .setDescription('LandGriffon is a conservation planning platform.')
      .setVersion(process.env.npm_package_version || 'development')
      .addBearerAuth({
        type: 'http',
      })
      .build();
  const swaggerDocument: OpenAPIObject = SwaggerModule.createDocument(
    app,
    swaggerOptions,
  );
  SwaggerModule.setup('/swagger', app, swaggerDocument);

  app.useGlobalPipes(
    new ValidationPipe({
      forbidUnknownValues: true,
      forbidNonWhitelisted: true,
      whitelist: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new SensitiveInfoGuard());
  const reflector: Reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  app.enableShutdownHooks();

  const port: number = process.env.PORT || serverConfig.port;
  await app.listen(port);
  logger.log(`Application listening on port ${port}`);
}

bootstrap();
