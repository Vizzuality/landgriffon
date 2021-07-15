import {
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
import { TimestampedBaseEntity } from 'baseEntities/timestamped-base-entity';

export const sourcingRecordResource: BaseServiceResource = {
  className: 'SourcingRecord',
  name: {
    singular: 'sourcingRecord',
    plural: 'sourcingRecords',
  },
  entitiesAllowedAsIncludes: [],
  columnsAllowedAsFilter: ['tonnage', 'year'],
};

@Entity('sourcing_records')
export class SourcingRecord extends TimestampedBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id!: string;

  @Column({ type: 'int', nullable: true })
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

  /**
   * @Debt: make this required and auto-set
   */
  @ManyToOne(() => User, (user: User) => user.id)
  @ApiProperty()
  updatedById?: string;
}
