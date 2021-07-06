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

export const sourcingRecordGroupResource: BaseServiceResource = {
  className: 'SourcingRecordGroup',
  name: {
    singular: 'sourcingRecordGroup',
    plural: 'sourcingRecordGroups',
  },
  entitiesAllowedAsIncludes: [],
};

@Entity()
export class SourcingRecordGroup extends BaseEntity {
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

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @ApiProperty()
  lastEdited!: string;

  @ManyToOne(() => User, (user: User) => user.sourcingRecordGroups, {
    eager: false,
  })
  lastEditedUser?: User;

  /**
   * @debt Auto-assign user and make not nullable
   */
  @Column({ nullable: true })
  @ApiPropertyOptional()
  lastEditedUserId?: string;
}
