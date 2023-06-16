import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { BaseServiceResource } from 'types/resource.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from 'modules/users/user.entity';
import { Material } from 'modules/materials/material.entity';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import {
  LOCATION_TYPES,
  SourcingLocation,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { TimestampedBaseEntity } from 'baseEntities/timestamped-base-entity';
import { Scenario } from 'modules/scenarios/scenario.entity';
import {
  REPLACED_ADMIN_REGIONS_TABLE_NAME,
  REPLACED_BUSINESS_UNITS_TABLE_NAME,
  REPLACED_MATERIALS_TABLE_NAME,
  REPLACED_PRODUCERS_TABLE_NAME,
  REPLACED_T1SUPPLIERS_TABLE_NAME,
} from 'modules/scenario-interventions/intermediate-table-names/intermediate.table.names';

export enum SCENARIO_INTERVENTION_STATUS {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DELETED = 'deleted',
}

export enum SCENARIO_INTERVENTION_TYPE {
  DEFAULT = 'default',
  NEW_SUPPLIER = 'Source from new supplier or location',
  CHANGE_PRODUCTION_EFFICIENCY = 'Change production efficiency',
  NEW_MATERIAL = 'Switch to a new material',
}

export const scenarioResource: BaseServiceResource = {
  className: 'ScenarioIntervention',
  name: {
    singular: 'scenarioIntervention',
    plural: 'scenarioInterventions',
  },
  entitiesAllowedAsIncludes: ['scenario'],
  columnsAllowedAsFilter: [],
};

@Entity()
export class ScenarioIntervention extends TimestampedBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  /**
   * Data fields
   */
  @ApiProperty()
  @Column({ nullable: false, default: 'Untitled' })
  title!: string;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  description?: string;

  @ApiProperty()
  @Column({
    type: 'enum',
    enum: SCENARIO_INTERVENTION_STATUS,
    default: SCENARIO_INTERVENTION_STATUS.ACTIVE,
  })
  status!: SCENARIO_INTERVENTION_STATUS;

  @ApiProperty()
  @Column({
    type: 'enum',
    enum: SCENARIO_INTERVENTION_TYPE,
    default: SCENARIO_INTERVENTION_TYPE.DEFAULT,
  })
  type!: SCENARIO_INTERVENTION_TYPE;

  @ApiProperty()
  @Column()
  startYear!: number;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  endYear?: number;

  @ApiProperty()
  @Column()
  percentage!: number;

  @Column({ type: 'jsonb', nullable: true })
  @ApiProperty()
  newIndicatorCoefficients?: JSON;

  @Column({ type: 'jsonb', nullable: true })
  createDto?: JSON;

  @ManyToOne(
    () => Scenario,
    (scenario: Scenario) => scenario.scenarioInterventions,
    { onDelete: 'CASCADE' },
  )
  @ApiProperty({ type: () => Scenario })
  @JoinColumn({ name: 'scenarioId' })
  scenario!: Scenario;

  @Index()
  @Column({ nullable: false })
  scenarioId!: string;

  /**
   * Relationships with other entities - links of replaced relationships on this intervention
   */
  @ManyToMany(() => Material, { eager: true })
  @JoinTable({ name: REPLACED_MATERIALS_TABLE_NAME })
  replacedMaterials: Material[];

  @ManyToMany(() => BusinessUnit, { eager: true })
  @JoinTable({ name: REPLACED_BUSINESS_UNITS_TABLE_NAME })
  replacedBusinessUnits: BusinessUnit[];

  @ManyToMany(() => Supplier, { eager: true })
  @JoinTable({ name: REPLACED_T1SUPPLIERS_TABLE_NAME })
  replacedT1Suppliers: Supplier[];

  @ManyToMany(() => Supplier, { eager: true })
  @JoinTable({ name: REPLACED_PRODUCERS_TABLE_NAME })
  replacedProducers: Supplier[];

  @ManyToMany(() => AdminRegion, { eager: true })
  @JoinTable({ name: REPLACED_ADMIN_REGIONS_TABLE_NAME })
  replacedAdminRegions: AdminRegion[];

  @OneToMany(
    () => SourcingLocation,
    (sourcingLocations: SourcingLocation) =>
      sourcingLocations.scenarioIntervention,
    { cascade: true, onDelete: 'CASCADE' },
  )
  replacedSourcingLocations: SourcingLocation[];

  /**
   * Relationships with other entities - list of "ne" relationships
   */
  @ManyToOne(() => Material, { eager: true })
  @ApiPropertyOptional({ type: () => Material })
  newMaterial: Material;

  @ManyToOne(() => BusinessUnit, { eager: true })
  @ApiPropertyOptional()
  newBusinessUnit: BusinessUnit;

  @ManyToOne(() => Supplier, { eager: true })
  @ApiPropertyOptional()
  newT1Supplier: Supplier;

  @ManyToOne(() => Supplier, { eager: true })
  @ApiPropertyOptional()
  newProducer: Supplier;

  @ManyToOne(() => AdminRegion, { eager: true })
  @ApiPropertyOptional()
  newAdminRegion: AdminRegion;

  /**
   * New sourcing data, if intervention type involves supplier change:
   */

  @ApiPropertyOptional()
  @Column({ nullable: true })
  newLocationType?: LOCATION_TYPES;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  newLocationCountryInput?: string;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  newLocationAddressInput?: string;

  @ApiPropertyOptional()
  @Column({ type: 'decimal', nullable: true })
  newLocationLatitudeInput?: number;

  @ApiPropertyOptional()
  @Column({ type: 'decimal', nullable: true })
  newLocationLongitudeInput?: number;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  newMaterialTonnageRatio?: number;

  /**
   * New Sourcing locations that will be created by Intervention
   */

  @OneToMany(
    () => SourcingLocation,
    (sourcingLocations: SourcingLocation) =>
      sourcingLocations.scenarioIntervention,
    { cascade: true },
  )
  newSourcingLocations?: SourcingLocation[];

  /**
   * Relationships with User
   */
  @ManyToOne(() => User, (user: User) => user.scenarioInterventionsLastEdited, {
    eager: false,
  })
  @ApiProperty({ type: () => User })
  updatedBy?: User;

  /**
   * @debt Auto-assign user and make not nullable
   */
  @Column({ nullable: true })
  @ApiPropertyOptional()
  updatedById?: string;
}
