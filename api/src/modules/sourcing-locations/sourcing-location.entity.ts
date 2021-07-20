import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { User } from 'modules/users/user.entity';
import { Material } from 'modules/materials/material.entity';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { BaseServiceResource } from 'types/resource.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TimestampedBaseEntity } from 'baseEntities/timestamped-base-entity';
import { GeoRegion } from 'modules/geo-regions/geo-region.entity';
import { SourcingRecordGroup } from 'modules/sourcing-record-groups/sourcing-record-group.entity';

export enum LOCATION_TYPES {
  PRODUCTION_UNIT = 'Production unit',
  PROCESSING_FACILITY = 'Processing facility',
  TIER1_TRADE_FACILITY = 'Tier 1 Trade facility',
  TIER2_TRADE_FACILITY = 'Tier 2 Trade facility',
  ORIGIN_COUNTRY = 'Origin Country',
  UNKNOWN = 'Unknown',
}

export enum LOCATION_ACCURACY {
  LOW = 'LOW',
  MID = 'MID',
  HIGH = 'HIGH',
}

export const sourcingLocationResource: BaseServiceResource = {
  className: 'SourcingLocation',
  name: {
    singular: 'sourcingLocation',
    plural: 'sourcingLocations',
  },
  entitiesAllowedAsIncludes: [],
  columnsAllowedAsFilter: ['title'],
};

@Entity()
export class SourcingLocation extends TimestampedBaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiPropertyOptional()
  @Column({ type: 'text', nullable: true })
  title?: string;

  @ApiPropertyOptional()
  @Column({ type: 'decimal', nullable: true })
  locationLatitude?: number;

  @ApiPropertyOptional()
  @Column({ type: 'decimal', nullable: true })
  locationLongitude?: number;

  @Column({
    type: 'enum',
    enum: LOCATION_TYPES,
    default: LOCATION_TYPES.UNKNOWN,
  })
  @ApiProperty()
  locationType!: LOCATION_TYPES;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional()
  locationAddressInput?: string;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional()
  locationCountryInput?: string;

  @Column({
    type: 'enum',
    enum: LOCATION_ACCURACY,
    default: LOCATION_ACCURACY.LOW,
  })
  @ApiProperty()
  locationAccuracy!: LOCATION_ACCURACY;

  @ManyToOne(
    () => GeoRegion,
    (geoRegion: GeoRegion) => geoRegion.sourcingLocations,
    { eager: false },
  )
  geoRegion: GeoRegion;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  geoRegionId?: string;

  @Column({ type: 'jsonb', nullable: true })
  @ApiPropertyOptional()
  metadata: JSON;

  @ManyToOne(() => User, (user: User) => user.sourcingLocations, {
    eager: false,
  })
  updatedBy: User;

  @ManyToOne(() => Material, (mat: Material) => mat.sourcingLocations, {
    eager: false,
  })
  material: Material;

  @ManyToOne(() => AdminRegion, (aR: AdminRegion) => aR.sourcingLocations, {
    eager: false,
  })
  adminRegion: AdminRegion;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  adminRegionId?: string;

  @ManyToOne(() => BusinessUnit, (bu: BusinessUnit) => bu.sourcingLocations, {
    eager: false,
  })
  businessUnit: BusinessUnit;

  @ManyToOne(
    () => Supplier,
    (supplier: Supplier) => supplier.sourcingLocations,
    {
      eager: false,
    },
  )
  t1Supplier: Supplier;

  @ManyToOne(
    () => Supplier,
    (supplier: Supplier) => supplier.sourcingLocations,
    {
      eager: false,
    },
  )
  producer: Supplier;

  @ManyToOne(
    () => SourcingRecordGroup,
    (sourcingRecordGroup: SourcingRecordGroup) => sourcingRecordGroup.id,
    {
      eager: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn()
  @ApiPropertyOptional()
  sourcingRecordGroupId: string;
}
