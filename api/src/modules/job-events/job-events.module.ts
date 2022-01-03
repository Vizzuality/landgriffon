import { Module } from '@nestjs/common';
import { JobEventsController } from 'modules/job-events/job-events.controller';
import { JobEventsService } from 'modules/job-events/job-events.service';
import { JobEventRepository } from 'modules/job-events/job-event.repository';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([JobEventRepository])],
  controllers: [JobEventsController],
  providers: [JobEventsService],
  exports: [JobEventsService],
})
export class JobEventsModule {}
