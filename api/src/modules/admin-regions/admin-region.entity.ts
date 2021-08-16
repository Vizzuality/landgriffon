import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';
import { GeoRegion } from 'modules/geo-regions/geo-region.entity';
import { BaseServiceResource } from 'types/resource.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IndicatorCoefficient } from 'modules/indicator-coefficients/indicator-coefficient.entity';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';

export enum ADMIN_REGIONS_STATUS {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DELETED = 'deleted',
}

export const adminRegionResource: BaseServiceResource = {
  className: 'AdminRegion',
  name: {
    singular: 'adminRegion',
    plural: 'adminRegions',
  },
  entitiesAllowedAsIncludes: [],
  columnsAllowedAsFilter: ['name', 'description', 'status'],
};

@Entity()
@Tree('materialized-path')
export class AdminRegion extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @TreeChildren()
  children: AdminRegion[];

  @TreeParent()
  @ApiPropertyOptional()
  parent: AdminRegion;

  @Column({ type: 'text', unique: true, nullable: true })
  gadmId?: string

  @Column({ nullable: true })
  @ApiPropertyOptional()
  name?: string;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  description?: string;

  @Column({
    type: 'enum',
    enum: ADMIN_REGIONS_STATUS,
    enumName: 'entityStatus',
    default: ADMIN_REGIONS_STATUS.INACTIVE,
  })
  @ApiProperty()
  status!: ADMIN_REGIONS_STATUS;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  isoA2?: string;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  isoA3?: string;

  @OneToMany(
    () => IndicatorCoefficient,
    (ic: IndicatorCoefficient) => ic.adminRegion,
  )
  indicatorCoefficients: IndicatorCoefficient[];

  /**
   * @debt: check if this needs to be required
   */

  @ApiPropertyOptional()
  @OneToMany(
    () => SourcingLocation,
    (srcLoc: SourcingLocation) => srcLoc.material,
  )
  sourcingLocations: SourcingLocation[];

  @ApiProperty()
  @ManyToOne(() => GeoRegion, (geo: GeoRegion) => geo.adminRegions)
  geoRegion: GeoRegion;
}
