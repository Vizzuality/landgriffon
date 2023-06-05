import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TimestampedBaseEntity } from 'baseEntities/timestamped-base-entity';
import { BaseServiceResource } from 'types/resource.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from 'modules/users/user.entity';

export const taskResource: BaseServiceResource = {
  className: 'Task',
  name: {
    singular: 'task',
    plural: 'tasks',
  },
  entitiesAllowedAsIncludes: ['user'],
  columnsAllowedAsFilter: ['status', 'data', 'createdBy'],
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

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, (user: User) => user.tasks)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  userId!: string;

  @ApiProperty()
  @Column({ type: 'enum', enum: TASK_STATUS, default: TASK_STATUS.PROCESSING })
  status!: TASK_STATUS;

  @ApiPropertyOptional()
  @Column({ type: 'text', nullable: true })
  message?: string;

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

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  dismissedBy?: string;
}
