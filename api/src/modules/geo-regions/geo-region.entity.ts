import {
  BaseEntity,
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { BaseServiceResource } from 'types/resource.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';

export const geoRegionResource: BaseServiceResource = {
  className: 'GeoRegion',
  name: {
    singular: 'geoRegion',
    plural: 'geoRegions',
  },
  entitiesAllowedAsIncludes: [],
  columnsAllowedAsFilter: ['name'],
};

@Entity()
export class GeoRegion extends BaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text', array: true, nullable: true })
  h3Compact?: string[];

  @Column({ type: 'text', array: true, nullable: true })
  h3Flat?: string[];

  @Column({ type: 'int', nullable: true })
  h3FlatLength?: number;

  @Column({ type: 'text', unique: true, nullable: true })
  @ApiPropertyOptional()
  name?: string;

  @Index({ spatial: true })
  @Column({
    type: 'geometry',
    srid: 4326,
    nullable: true,
  })
  @ApiPropertyOptional()
  theGeom?: JSON;

  @Column({ type: 'boolean', default: true })
  isCreatedByUser: boolean;

  @ApiPropertyOptional()
  @OneToMany(() => AdminRegion, (adminReg: AdminRegion) => adminReg.geoRegion)
  adminRegions?: AdminRegion[];

  @ApiPropertyOptional()
  @OneToMany(
    () => SourcingLocation,
    (sourcingLocation: SourcingLocation) => sourcingLocation.geoRegion,
  )
  sourcingLocations?: SourcingLocation[];
}
