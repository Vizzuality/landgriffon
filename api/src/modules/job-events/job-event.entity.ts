import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TimestampedBaseEntity } from 'baseEntities/timestamped-base-entity';
import { BaseServiceResource } from 'types/resource.interface';
import { JobId } from 'bull';

export const jobResource: BaseServiceResource = {
  className: 'Jobs',
  name: {
    singular: 'job',
    plural: 'jobs',
  },
  entitiesAllowedAsIncludes: [],
  columnsAllowedAsFilter: ['status', 'data'],
};

export enum JOB_STATUS {
  CREATED = 'created',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ABORTED = 'aborted',
  FAILED = 'failed',
}

export enum JOB_TYPE {
  UNKNOWN = 'unknown',
  SOURCING_DATA_IMPORT = 'sourcing_data_import',
}

@Entity(jobResource.name.plural)
export class JobEvent extends TimestampedBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: JOB_TYPE, default: JOB_TYPE.UNKNOWN })
  type!: string;

  @Column()
  entityId!: string;

  @Column({ type: 'bigint' })
  redisJobId!: JobId;

  @Column({ type: 'enum', enum: JOB_STATUS, default: JOB_STATUS.CREATED })
  status!: JOB_STATUS;

  @Column({ type: 'json' })
  data!: Record<string, any>;
}
