import { Injectable, NotFoundException } from '@nestjs/common';
import { JobId } from 'bull';
import {
  JOB_STATUS,
  JOB_TYPE,
  JobEvent,
  jobEventResource,
} from 'modules/job-events/job-event.entity';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';
import { CreateJobEventDto } from 'modules/job-events/dto/create-job-event.dto';
import { UpdateJobEventDto } from 'modules/job-events/dto/update-job-event.dto';
import { JobEventRepository } from 'modules/job-events/job-event.repository';
import { AppInfoDTO } from 'dto/info.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class JobEventsService extends AppBaseService<
  JobEvent,
  CreateJobEventDto,
  UpdateJobEventDto,
  AppInfoDTO
> {
  constructor(
    @InjectRepository(JobEventRepository)
    public readonly jobRepository: JobEventRepository,
  ) {
    super(
      jobRepository,
      jobEventResource.name.singular,
      jobEventResource.name.singular,
    );
  }

  get serializerConfig(): JSONAPISerializerConfig<JobEvent> {
    return {
      attributes: ['timestamp', 'topic', 'status', 'data'],
      keyForAttribute: 'camelCase',
    };
  }

  async getJobsByUser(userId: string): Promise<JobEvent[]> {
    const jobs: JobEvent[] = await this.jobRepository.find({
      where: { entityId: userId },
    });
    if (!jobs) throw new NotFoundException('No Jobs found for current user');
    return jobs;
  }

  async createImportJobEvent(createJob: {
    userId: string;
    redisJobId: JobId;
    data?: Record<string, any>;
  }): Promise<JobEvent> {
    const { userId, redisJobId, data } = createJob;
    return this.create({
      type: JOB_TYPE.SOURCING_DATA_IMPORT,
      status: JOB_STATUS.PROCESSING,
      entityId: userId,
      redisJobId,
      data: data ?? {},
    });
  }

  // TODO: First version. Add better typing to data & errors and enhance storage of both. We need to decide how we want to tackle this
  async updateImportJobEvent(updateImportJobEvent: {
    redisJobId: JobId;
    newStatus: JOB_STATUS;
    newData?: Record<string, any>;
    newErrors?: Record<string, any>;
  }): Promise<void> {
    /**
     * @debt
     * TypeORM does not provide a friendly API to handle json fields on a UPDATE statement
     * For now we are retrieving the event, update data withing the API and save it back
     * Investigate how we could improve this
     */
    const { redisJobId, newStatus, newData, newErrors } = updateImportJobEvent;
    const jobEvent: JobEvent | undefined = await this.jobRepository.findOne({
      redisJobId,
    });
    if (!jobEvent) {
      throw new NotFoundException(
        `Could not found Redis job with ID: ${redisJobId}`,
      );
    }
    const { data, errors } = jobEvent;
    jobEvent.data = { ...data, ...newData };
    jobEvent.status = newStatus;

    if (newErrors) {
      jobEvent.errors = { ...errors, ...newErrors };
    }

    jobEvent.data = { ...data, ...newData };
    jobEvent.status = newStatus;
    await jobEvent.save();
  }
}
