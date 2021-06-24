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
  id: string;

  @Column({ type: 'numeric', nullable: true })
  tonnage: number;

  @Column({ type: 'int', nullable: true })
  year: number;

  @ManyToOne(() => SourcingLocation, (srcLoc: SourcingLocation) => srcLoc.id)
  @JoinColumn({ name: 'sourcing_location_id' })
  sourcingLocationsId: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: JSON;

  @Column({
    type: 'timestamp',
    name: 'last_edited',
    default: () => 'CURRENT_TIMESTAMP',
  })
  lastEdited: string;

  @ManyToOne(() => User, (user: User) => user.id)
  @JoinColumn({ name: 'last_edited_user_id' })
  lastEditedUserId: string;
}
