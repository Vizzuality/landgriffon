import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
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
import { SourcingLocationGroup } from 'modules/sourcing-location-groups/sourcing-location-group.entity';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';

export enum LOCATION_TYPES {
  PRODUCTION_UNIT = 'production unit',
  PROCESSING_FACILITY = 'processing facility',
  TIER1_TRADE_FACILITY = 'tier 1 Trade facility',
  TIER2_TRADE_FACILITY = 'tier 2 Trade facility',
  ORIGIN_COUNTRY = 'origin Country',
  UNKNOWN = 'unknown',
  AGGREGATION_POINT = 'aggregation point',
  POINT_OF_PRODUCTION = 'point of production',
  COUNTRY_OF_PRODUCTION = 'country of production',
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
  entitiesAllowedAsIncludes: ['sourcingLocationGroup'],
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
  @JoinColumn({ name: 'updatedById' })
  updatedBy: User;

  /**
   * @debt: Make this required and auto-set once auth is great again
   */
  @Column({ nullable: true })
  updatedById: string;

  @ManyToOne(() => Material, (mat: Material) => mat.sourcingLocations, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'materialId' })
  material: Material;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  materialId: string;

  @ManyToOne(() => AdminRegion, (aR: AdminRegion) => aR.sourcingLocations, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'adminRegionId' })
  adminRegion: AdminRegion;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  adminRegionId?: string;

  @ManyToOne(() => BusinessUnit, (bu: BusinessUnit) => bu.sourcingLocations, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'businessUnitId' })
  businessUnit: BusinessUnit;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  businessUnitId: string;

  @ManyToOne(
    () => Supplier,
    (supplier: Supplier) => supplier.sourcingLocations,
    {
      eager: false,
      onDelete: 'CASCADE',
    },
  )
  t1Supplier: Supplier;

  @ManyToOne(
    () => Supplier,
    (supplier: Supplier) => supplier.sourcingLocations,
    {
      cascade: true,
      eager: false,
      onDelete: 'CASCADE',
    },
  )
  producer: Supplier;

  @ManyToOne(
    () => SourcingLocationGroup,
    (sourcingLocationGroup: SourcingLocationGroup) => sourcingLocationGroup.id,
    {
      eager: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'sourcingLocationGroupId' })
  sourcingLocationGroup: SourcingLocationGroup;

  @Column({ nullable: true })
  @ApiProperty()
  sourcingLocationGroupId!: string;

  @OneToMany(
    () => SourcingRecord,
    (sourcingRecords: SourcingRecord) => sourcingRecords.sourcingLocation,
    { cascade: true, onDelete: 'CASCADE' },
  )
  sourcingRecords: SourcingRecord[];
}
