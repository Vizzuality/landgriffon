import {
  Check,
  Column,
  Entity,
  Index,
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
import { ScenarioIntervention } from 'modules/scenario-interventions/scenario-intervention.entity';

export enum LOCATION_TYPES {
  UNKNOWN = 'unknown',
  AGGREGATION_POINT = 'aggregation point',
  POINT_OF_PRODUCTION = 'point of production',
  COUNTRY_OF_PRODUCTION = 'country of production',
}

//TODO Refactor to use the dash version also in the DB, to"
//     1. Avoid using strings with empty spaces
//     2. Avoid duplicating types (with dash/ with no dash)
export enum LOCATION_TYPES_PARAMS {
  UNKNOWN = 'unknown',
  AGGREGATION_POINT = 'aggregation-point',
  POINT_OF_PRODUCTION = 'point-of-production',
  COUNTRY_OF_PRODUCTION = 'country-of-production',
}

export enum LOCATION_ACCURACY {
  LOW = 'LOW',
  MID = 'MID',
  HIGH = 'HIGH',
}

export enum SOURCING_LOCATION_TYPE_BY_INTERVENTION {
  CANCELED = 'CANCELED_BY_INTERVENTION',
  REPLACING = 'CREATED_BY_INTERVENTION',
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
@Check('(num_nonnulls("scenarioInterventionId","interventionType") in (0,2))')
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

  @ApiPropertyOptional()
  @Column({ type: 'text', nullable: true })
  locationWarning?: string;

  @ManyToOne(
    () => GeoRegion,
    (geoRegion: GeoRegion) => geoRegion.sourcingLocations,
    { eager: true },
  )
  geoRegion: GeoRegion;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  geoRegionId: string;

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
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'materialId' })
  material: Material;

  @ApiPropertyOptional()
  @Column()
  materialId: string;

  @ManyToOne(() => AdminRegion, (aR: AdminRegion) => aR.sourcingLocations, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'adminRegionId' })
  adminRegion: AdminRegion;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  adminRegionId: string;

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
  @JoinColumn({ name: 't1SupplierId' })
  t1Supplier: Supplier;

  @Index()
  @Column({ nullable: true })
  t1SupplierId?: string;

  @ManyToOne(
    () => Supplier,
    (supplier: Supplier) => supplier.sourcingLocations,
    {
      eager: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'producerId' })
  producer: Supplier;

  @Index()
  @Column({ nullable: true })
  producerId?: string;

  @ManyToOne(
    () => SourcingLocationGroup,
    (sourcingLocationGroup: SourcingLocationGroup) => sourcingLocationGroup.id,
    {
      eager: false,
    },
  )
  @JoinColumn({ name: 'sourcingLocationGroupId' })
  sourcingLocationGroup: SourcingLocationGroup;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  sourcingLocationGroupId?: string;

  @Column('enum', {
    nullable: true,
    enum: SOURCING_LOCATION_TYPE_BY_INTERVENTION,
  })
  @ApiPropertyOptional()
  // TODO - come up with better naming
  interventionType?: SOURCING_LOCATION_TYPE_BY_INTERVENTION;

  @OneToMany(
    () => SourcingRecord,
    (sourcingRecords: SourcingRecord) => sourcingRecords.sourcingLocation,
    { cascade: true },
  )
  sourcingRecords: SourcingRecord[];

  @ManyToOne(() => ScenarioIntervention, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'scenarioInterventionId' })
  scenarioIntervention: ScenarioIntervention;

  @Index()
  @Column({ nullable: true })
  @ApiPropertyOptional()
  scenarioInterventionId?: string;
}
