import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { User } from 'modules/users/user.entity';
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
  @ApiProperty()
  id: string;

  @Column({ type: 'text', nullable: false })
  @ApiProperty()
  title!: string;

  /**
   * @debt Only reference: Add relationship to material entity
   */
  @Column({ nullable: true })
  @ApiPropertyOptional()
  materialId?: string;

  /**
   * @debt Only reference: Add relationship to admin-region
   */
  @Column({ nullable: true })
  @ApiPropertyOptional()
  adminRegionId?: string;

  @ManyToOne(() => BusinessUnit, (bu: BusinessUnit) => bu.id)
  @ApiPropertyOptional()
  businessUnitId: string;

  @ManyToOne(() => Supplier, (supplier: Supplier) => supplier.id)
  @ApiPropertyOptional()
  t1SupplierId: string;

  @ManyToOne(() => Supplier, (supplier: Supplier) => supplier.id)
  @ApiPropertyOptional()
  producerId: string;

  /**
   * @debt Only reference: Add relationship to admin-region
   */
  @Column({ nullable: true })
  @ApiPropertyOptional()
  sourcingRecordGroupId?: string;

  @Column({
    type: 'enum',
    enum: LOCATION_TYPES,
    enumName: 'locationTypes',
    nullable: false,
    default: LOCATION_TYPES.UNKNOWN,
  })
  @ApiProperty()
  locationType: LOCATION_TYPES;

  @Column({ type: 'text', name: 'locationAddressInput', nullable: true })
  @ApiPropertyOptional()
  locationAddressInput: string;

  @Column({ type: 'text', name: 'locationCountryInput', nullable: true })
  @ApiPropertyOptional()
  locationCountryInput: string;

  @Column({
    type: 'enum',
    name: 'locationAddressAccuracy',
    enum: LOCATION_ACCURACY,
    nullable: false,
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
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @ApiPropertyOptional()
  lastEdited: string;

  /**
   * @debt This should become required once we enforce user auth to create resources
   */
  @ManyToOne(() => User, (user: User) => user.id)
  @ApiPropertyOptional()
  lastEditedUserId?: string;
}
