import { NestFactory } from '@nestjs/core';
import { CommandModule, CommandService } from 'nestjs-command';
import { AppModule } from 'app.module';
import { INestApplicationContext } from '@nestjs/common';

async function bootstrap(): Promise<void> {
  const app: INestApplicationContext =
    await NestFactory.createApplicationContext(AppModule, {
      logger: ['error', 'log'],
    });

  try {
    await app.select(CommandModule).get(CommandService).exec();
    await app.close();
  } catch (error) {
    console.error(error);
    await app.close();
    process.exit(1);
  }
}
bootstrap();
