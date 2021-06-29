import {
  BaseEntity,
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
};

@Entity()
export class SourcingLocation extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  title: string;

  /**
   * @debt Only reference: Add relationship to material entity
   */
  @ManyToOne(() => Material, (mat: Material) => mat.sourcingLocations)
  material: Material;

  @ManyToOne(() => AdminRegion, (aR: AdminRegion) => aR.sourcingLocations)
  adminRegion: AdminRegion;

  @ManyToOne(() => BusinessUnit, (bu: BusinessUnit) => bu.sourcingLocations)
  businessUnit: BusinessUnit;

  @ManyToOne(() => Supplier, (supplier: Supplier) => supplier.sourcingLocations)
  t1Supplier: Supplier;

  @ManyToOne(() => Supplier, (supplier: Supplier) => supplier.sourcingLocations)
  producer: Supplier;

  /**
   * @debt Only reference: Add relationship to admin-region
   */
  @Column()
  sourcingRecordGroupId: string;

  @Column({
    type: 'enum',
    name: 'location_types',
    enum: LOCATION_TYPES,
    enumName: 'location_types',
    default: LOCATION_TYPES.UNKNOWN,
  })
  locationTypes: LOCATION_TYPES;

  @Column({ type: 'text', name: 'location_address_input', nullable: true })
  locationAddressInput: string;

  @Column({ type: 'text', name: 'location_country_input', nullable: true })
  locationCountryInput: string;

  @Column({
    type: 'enum',
    name: 'locationAddressAccuracy',
    enum: LOCATION_ACCURACY,
    enumName: 'location_accuracy',
    default: LOCATION_ACCURACY.LOW,
  })
  @ApiProperty()
  locationAccuracy: LOCATION_ACCURACY;

  /**
   * @debt Only reference: Add relationship to geo-region
   */
  @Column({ nullable: true })
  @ApiPropertyOptional()
  geoRegionId?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: JSON;
  @Column({
    type: 'timestamp',
    name: 'last_edited',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @ApiPropertyOptional()
  lastEdited: string;

  @ApiPropertyOptional()
  @ManyToOne(() => User, (user: User) => user.sourcingLocations)
  lastEditedUser: User;
}
