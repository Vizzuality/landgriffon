import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
} from 'typeorm';
import { Geometry } from 'geojson';
import { AdminRegions } from '../admin-regions/admin-regions.entity';

@Entity()
export class GeoRegions extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @OneToMany(
    () => AdminRegions,
    (adminReg: AdminRegions) => adminReg.geoRegionId,
  )
  id: string;

  @Column({ name: 'h3_compact', type: 'text', array: true, nullable: true })
  h3Compact: string[];

  @Column({ nullable: true })
  name: string;

  @Column({ name: 'the_geom', type: 'geometry', nullable: true })
  theGeom: Geometry;
}
