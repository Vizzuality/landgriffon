import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BusinessUnits } from '../business-units/business-units.entity';
import { Suppliers } from '../suppliers/suppliers.entity';
import { User } from '../users/user.entity';

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

@Entity('sourcing_locations')
export class SourcingLocation extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  title: string;

  /**
   * @debt Only reference: Add relationship to material entity
   */
  @Column()
  materialId: string;

  /**
   * @debt Only reference: Add relationship to admin-region
   */
  @Column()
  adminRegionId: string;

  @ManyToOne(() => BusinessUnits, (bu: BusinessUnits) => bu.id)
  @JoinColumn({ name: 'business_unit_id' })
  businessUnitId: string;

  @ManyToOne(() => Suppliers, (supplier: Suppliers) => supplier.id)
  @JoinColumn({ name: 't1_supplier_id' })
  t1SupplierId: string;

  @ManyToOne(() => Suppliers, (supplier: Suppliers) => supplier.id)
  @JoinColumn({ name: 'producer_id' })
  producerId: string;

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
    name: 'location_address_accuracy',
    enum: LOCATION_ACCURACY,
    enumName: 'location_accuracy',
    default: LOCATION_ACCURACY.LOW,
  })
  locationAccuracy: LOCATION_ACCURACY;

  /**
   * @debt Only reference: Add relationship to geo-region
   */
  @Column()
  geoRegionId: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: JSON;
  @Column({
    type: 'timestamp',
    name: 'last_edited',
    default: () => 'CURRENT_TIMESTAMP',
  })
  lastEdited: string;

  @ManyToOne(() => User, (user: User) => user.id)
  @JoinColumn({ name: 'last_edited_user_id' })
  lastEditedUserId: string;
}
