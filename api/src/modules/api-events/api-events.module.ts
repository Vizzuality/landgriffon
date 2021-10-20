import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApiEvent } from 'modules/api-events/api-event.entity';
import {
  FirstApiEventByTopicAndKind,
  LatestApiEventByTopicAndKind,
} from 'modules/api-events/api-event.topic+kind.entity';
import { ApiEventsController } from 'modules/api-events/api-events.controller';
import { ApiEventsService } from 'modules/api-events/api-events.service';

export const logger: Logger = new Logger('ApiEvents');

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
