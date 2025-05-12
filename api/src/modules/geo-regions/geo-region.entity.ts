import {
  BaseEntity,
  Check,
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
import { Geometry } from 'geojson';

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

  @Column({ type: 'text', unique: false, nullable: true })
  @ApiPropertyOptional()
  name?: string;

  @Index({ spatial: true })
  @Check('geo_region_valid_geom_check', `ST_IsValid("theGeom")`)
  @Column({
    type: 'geometry',
    srid: 4326,
  })
  @ApiPropertyOptional()
  theGeom?: Geometry;

  // TODO: It might be interesting to add a trigger to calculate the value in case it's not provided. We are considering that EUDR will alwaus provide the value
  //  but not the regular ingestion
  @Column({ type: 'decimal', nullable: true })
  totalArea: number;

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
