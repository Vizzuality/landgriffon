import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from 'app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as config from 'config';
import * as helmet from 'helmet';

async function bootstrap(): Promise<void> {
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create(AppModule);
  const serverConfig: any = config.get('server');

  app.enableCors();
  app.use(helmet());

  const swaggerOptions = new DocumentBuilder()
    .setTitle('LandGriffon API')
    .setDescription('LandGriffon is a conservation planning platform.')
    .setVersion(process.env.npm_package_version || 'development')
    .addBearerAuth({
      type: 'apiKey',
      in: 'header',
      name: 'Authorization',
    })
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerOptions);
  SwaggerModule.setup('/swagger', app, swaggerDocument);

  app.enableShutdownHooks();

  const port = process.env.PORT || serverConfig.port;
  await app.listen(port);
  logger.log(`Application listening on port ${port}`);
}

bootstrap();
