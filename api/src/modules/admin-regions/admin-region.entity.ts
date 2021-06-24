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
import { GeoRegion } from 'modules/geo-regions/geo-region.entity';

export enum ADMIN_REGIONS_STATUS {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DELETED = 'deleted',
}

@Entity()
@Tree('materialized-path')
export class AdminRegion extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @TreeChildren()
  children: AdminRegion[];

  @TreeParent()
  parent: AdminRegion;

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

  @ManyToOne(() => GeoRegion, (geo: GeoRegion) => geo.id)
  @JoinColumn({ name: 'geo_region_id' })
  geoRegionId: string;
}
