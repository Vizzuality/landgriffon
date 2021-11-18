import { NestFactory } from '@nestjs/core';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from 'app.module';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import * as config from 'config';
import * as helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap(): Promise<void> {
  const logger: Logger = new Logger('bootstrap');
  const app: INestApplication = await NestFactory.create(AppModule);
  const serverConfig: any = config.get('server');

  app.use(helmet());
  app.enableCors();
  app.use(compression());

  const swaggerOptions: Omit<OpenAPIObject, 'components' | 'paths'> =
    new DocumentBuilder()
      .setTitle('LandGriffon API')
      .setDescription('LandGriffon is a conservation planning platform.')
      .setVersion(process.env.npm_package_version || 'development')
      .addBearerAuth({
        type: 'apiKey',
        in: 'header',
        name: 'Authorization',
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
      transform: true,
    }),
  );

  app.enableShutdownHooks();

  const port: number = process.env.PORT || serverConfig.port;
  await app.listen(port);
  logger.log(`Application listening on port ${port}`);
}

bootstrap();
