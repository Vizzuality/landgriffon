import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TimestampedBaseEntity } from 'baseEntities/timestamped-base-entity';
import { BaseServiceResource } from 'types/resource.interface';

export const taskResource: BaseServiceResource = {
  className: 'Task',
  name: {
    singular: 'task',
    plural: 'tasks',
  },
  entitiesAllowedAsIncludes: [],
  columnsAllowedAsFilter: ['status', 'data'],
};

export enum TASK_STATUS {
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ABORTED = 'aborted',
  FAILED = 'failed',
}

export enum TASK_TYPE {
  UNKNOWN = 'unknown',
  SOURCING_DATA_IMPORT = 'sourcing_data_import',
}

@Entity()
export class Task extends TimestampedBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: TASK_TYPE,
    nullable: false,
  })
  type!: string;

  @Column({ type: 'uuid' })
  createdBy!: string;

  @Column({ type: 'enum', enum: TASK_STATUS, default: TASK_STATUS.PROCESSING })
  status!: TASK_STATUS;

  @Column({ type: 'json' })
  data!: Record<string, any>;

  /**
   * @debt: Define proper typing for the fields below. Add logging to import-process
   */

  @Column('jsonb', { array: false, default: () => "'[]'" })
  logs!: Array<Record<string, any>>;

  @Column('jsonb', { array: false, default: () => "'[]'" })
  errors!: Array<Record<string, any>>;
}
