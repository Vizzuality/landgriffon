import { JOB_STATUS, JOB_TYPE } from 'modules/job-events/job-event.entity';
import { JobId } from 'bull';

export class CreateJobEventDto {
  type!: JOB_TYPE;

  status!: JOB_STATUS;

  entityId: string;

  redisJobId: JobId;

  data!: Record<string, any>;
}
