import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
} from 'typeorm';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';

@Entity()
export class GeoRegion extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @OneToMany(() => AdminRegion, (adminReg: AdminRegion) => adminReg.geoRegionId)
  id: string;

  @Column({ name: 'h3_compact', type: 'text', array: true, nullable: true })
  h3Compact: string[];

  @Column({ nullable: true })
  name: string;

  @Column({ name: 'the_geom', type: 'jsonb', nullable: true })
  theGeom: JSON;
}
