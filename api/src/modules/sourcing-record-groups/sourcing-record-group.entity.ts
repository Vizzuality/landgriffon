import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'modules/users/user.entity';
import { BaseServiceResource } from 'types/resource.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TimestampedBaseEntity } from 'baseEntities/timestamped-base-entity';

export const sourcingRecordGroupResource: BaseServiceResource = {
  className: 'SourcingRecordGroup',
  name: {
    singular: 'sourcingRecordGroup',
    plural: 'sourcingRecordGroups',
  },
  entitiesAllowedAsIncludes: [],
  columnsAllowedAsFilter: ['title', 'description'],
};

@Entity()
export class SourcingRecordGroup extends TimestampedBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id!: string;

  @Column({ nullable: true })
  @ApiProperty()
  title!: string;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  description?: string;

  @Column({ type: 'jsonb', nullable: true })
  @ApiPropertyOptional()
  metadata?: JSON;

  @ManyToOne(() => User, (user: User) => user.sourcingRecordGroups, {
    eager: false,
  })
  updatedBy?: User;

  /**
   * @debt Auto-assign user and make not nullable
   */
  @Column({ nullable: true })
  @ApiPropertyOptional()
  updatedById?: string;
}
