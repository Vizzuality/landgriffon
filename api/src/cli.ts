import { NestFactory } from '@nestjs/core';
import { CommandModule, CommandService } from 'nestjs-command';
import { AppModule } from 'app.module';
import { INestApplicationContext, Logger } from '@nestjs/common';

async function bootstrap(): Promise<void> {
  const app: INestApplicationContext =
    await NestFactory.createApplicationContext(AppModule, {
      logger: ['error'],
    });

  try {
    await app.select(CommandModule).get(CommandService).exec();
    await app.close();
  } catch (error) {
    const logger: Logger = new Logger();
    logger.error(error);
    await app.close();
    process.exit(1);
  }
}
bootstrap();
