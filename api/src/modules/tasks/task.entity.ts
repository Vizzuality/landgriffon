import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TimestampedBaseEntity } from 'baseEntities/timestamped-base-entity';
import { BaseServiceResource } from 'types/resource.interface';
import { ApiProperty } from '@nestjs/swagger';

export const taskResource: BaseServiceResource = {
  className: 'Task',
  name: {
    singular: 'task',
    plural: 'tasks',
  },
  entitiesAllowedAsIncludes: [],
  columnsAllowedAsFilter: ['status', 'data', 'createdBy'],
};

export enum TASK_STATUS {
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ABORTED = 'aborted',
  FAILED = 'failed',
}

export enum TASK_STEP {
  UNKNOWN = 'unknown',
  SAVING_MSB = 'saving_msb', // Materials, Suppliers, Business-Units
  GEOLOCATING = 'geolocating',
  CALCULATING_IMPACT = 'calculating_impact',
  SAVING_IMPACT = 'saving_impact',
  DONE = 'done',
}

export const stepToPercentage: { [key in TASK_STEP]: number } = {
  unknown: 0.0,
  saving_msb: 0.0,
  geolocating: 25.0,
  calculating_impact: 50.0,
  saving_impact: 75.0,
  done: 100.0,
};

export enum TASK_TYPE {
  UNKNOWN = 'unknown',
  SOURCING_DATA_IMPORT = 'sourcing_data_import',
}

@Entity()
export class Task extends TimestampedBaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty()
  @Column({
    type: 'enum',
    enum: TASK_TYPE,
    nullable: false,
  })
  type!: string;

  @ApiProperty()
  @Column({ type: 'uuid' })
  userId!: string;

  @ApiProperty()
  @Column({ type: 'enum', enum: TASK_STATUS, default: TASK_STATUS.PROCESSING })
  status!: TASK_STATUS;

  @ApiProperty()
  @Column({ type: 'enum', enum: TASK_STEP, default: TASK_STEP.UNKNOWN })
  currentStep: TASK_STEP;

  @ApiProperty()
  @Column({ type: 'decimal', nullable: false, default: 0.0 })
  progress: number;

  @ApiProperty()
  @Column({ type: 'json' })
  data!: Record<string, any>;

  /**
   * @debt: Define proper typing for the fields below. Add logging to import-process
   */

  @ApiProperty()
  @Column('jsonb', { array: false, default: () => "'[]'" })
  logs!: Array<Record<string, any>>;

  @ApiProperty()
  @Column('jsonb', { array: false, default: () => "'[]'" })
  errors!: Array<Record<string, any>>;
}
