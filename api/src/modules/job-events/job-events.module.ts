import { Module } from '@nestjs/common';
import { JobEventsController } from 'modules/job-events/job-events.controller';
import { JobEventsService } from 'modules/job-events/job-events.service';

@Module({
  controllers: [JobEventsController],
  providers: [JobEventsService],
})
export class JobEventsModule {}
