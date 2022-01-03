import { EntityRepository, Repository } from 'typeorm';
import { JobEvent } from 'modules/job-events/job-event.entity';

@EntityRepository(JobEvent)
export class JobEventRepository extends Repository<JobEvent> {}
