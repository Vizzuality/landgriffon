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
  entitiesAllowedAsIncludes: ['sourcingLocation'],
  columnsAllowedAsFilter: ['tonnage', 'year'],
};

@Entity('sourcing_records')
export class SourcingRecord extends TimestampedBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id!: string;

  @Column({ type: 'decimal' })
  @ApiProperty()
  tonnage!: number;

  @Column({ type: 'int' })
  @ApiProperty()
  year!: number;

  @ManyToOne(() => SourcingLocation, (srcLoc: SourcingLocation) => srcLoc.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sourcingLocationId' })
  sourcingLocation: SourcingLocation;

  @Column({ nullable: true })
  sourcingLocationId!: string;

  @Column({ type: 'jsonb', nullable: true })
  @ApiPropertyOptional()
  metadata?: JSON;

  /**
   * @Debt: make this required and auto-set
   */
  @ManyToOne(() => User, (user: User) => user.id)
  @ApiProperty()
  updatedBy?: string;
}
