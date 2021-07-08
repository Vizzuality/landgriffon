import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'modules/users/user.entity';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { BaseServiceResource } from 'types/resource.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const sourcingRecordResource: BaseServiceResource = {
  className: 'SourcingRecord',
  name: {
    singular: 'sourcingRecord',
    plural: 'sourcingRecords',
  },
  entitiesAllowedAsIncludes: [],
};

@Entity('sourcing_records')
export class SourcingRecord extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id!: string;

  @Column({ type: 'numeric', nullable: true })
  @ApiPropertyOptional()
  tonnage?: number;

  @Column({ type: 'int', nullable: true })
  @ApiPropertyOptional()
  year?: number;

  @ManyToOne(() => SourcingLocation, (srcLoc: SourcingLocation) => srcLoc.id)
  @JoinColumn()
  @ApiProperty()
  sourcingLocationsId: string;

  @Column({ type: 'jsonb', nullable: true })
  @ApiPropertyOptional()
  metadata?: JSON;

  @Column({
    type: 'timestamp',
    name: 'last_edited',
    default: () => 'CURRENT_TIMESTAMP',
  })
  lastEdited: string;

  /**
   * @Debt: make this required and auto-set
   */
  @ManyToOne(() => User, (user: User) => user.id)
  @ApiProperty()
  lastEditedUserId?: string;
}
