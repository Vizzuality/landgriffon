import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TimestampedBaseEntity } from 'baseEntities/timestamped-base-entity';
import { BaseServiceResource } from 'types/resource.interface';
import { JobId } from 'bull';

export const jobEventResource: BaseServiceResource = {
  className: 'JobEvents',
  name: {
    singular: 'jobEvent',
    plural: 'jobsEvents',
  },
  entitiesAllowedAsIncludes: [],
  columnsAllowedAsFilter: ['status', 'data'],
};

export enum JOB_STATUS {
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ABORTED = 'aborted',
  FAILED = 'failed',
}

export enum JOB_TYPE {
  UNKNOWN = 'unknown',
  SOURCING_DATA_IMPORT = 'sourcing_data_import',
}

@Entity()
export class JobEvent extends TimestampedBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: JOB_TYPE,
    nullable: false,
  })
  type!: string;

  @Column({ type: 'uuid' })
  entityId!: string;

  @Column({ type: 'bigint' })
  redisJobId!: JobId;

  @Column({ type: 'enum', enum: JOB_STATUS, default: JOB_STATUS.PROCESSING })
  status!: JOB_STATUS;

  @Column({ type: 'json' })
  data!: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  errors?: Record<string, any>;
}
