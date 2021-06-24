import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  JoinColumn,
  ManyToOne,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';
import { GeoRegions } from 'modules/geo-regions/geo-regions.entity';

export enum ADMIN_REGIONS_STATUS {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DELETED = 'deleted',
}

@Entity()
@Tree('materialized-path')
export class AdminRegions extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @TreeChildren()
  children: AdminRegions[];

  @TreeParent()
  parent: AdminRegions;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ADMIN_REGIONS_STATUS,
    enumName: 'entity_status',
    default: ADMIN_REGIONS_STATUS.INACTIVE,
  })
  status: ADMIN_REGIONS_STATUS;

  @Column({ name: 'iso_a3', nullable: true })
  isoA3: string;

  @ManyToOne(() => GeoRegions, (geo: GeoRegions) => geo.id)
  @JoinColumn({ name: 'geo_region_id' })
  geoRegionId: string;
}
