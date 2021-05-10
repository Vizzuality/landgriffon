import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApiEvent } from './api-event.entity';
import {
  FirstApiEventByTopicAndKind,
  LatestApiEventByTopicAndKind,
} from './api-event.topic+kind.entity';
import { ApiEventsController } from './api-events.controller';
import { ApiEventsService } from './api-events.service';

export const logger = new Logger('ApiEvents');

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApiEvent,
      LatestApiEventByTopicAndKind,
      FirstApiEventByTopicAndKind,
    ]),
  ],
  providers: [ApiEventsService],
  controllers: [ApiEventsController],
  exports: [ApiEventsService],
})
export class ApiEventsModule {}
