import { JOB_STATUS } from 'modules/job-events/job-event.entity';

export class UpdateJobEventDto {
  status!: JOB_STATUS;

  data!: Record<string, any>;
}
