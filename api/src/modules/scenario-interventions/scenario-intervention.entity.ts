import {
  Column,
  Entity,
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
import { GeoRegion } from 'modules/geo-regions/geo-region.entity';

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
  @Column({ nullable: false })
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

  @Column({ type: 'jsonb' })
  @ApiProperty()
  newIndicatorCoefficients!: JSON;

  @ManyToOne(
    () => Scenario,
    (scenario: Scenario) => scenario.scenarioInterventions,
  )
  @ApiProperty({ type: () => Scenario })
  @JoinColumn({ name: 'scenarioId' })
  scenario!: Scenario;

  @Column({ nullable: false })
  scenarioId!: string;

  /**
   * Relationships with other entities - links of replaced relationships on this intervention
   */
  @ManyToMany(() => Material)
  @JoinTable()
  replacedMaterials?: Material[];

  @ManyToMany(() => BusinessUnit)
  @JoinTable()
  replacedBusinessUnits?: BusinessUnit[];

  @ManyToMany(() => Supplier)
  @JoinTable()
  replacedSuppliers?: Supplier[];

  @ManyToMany(() => AdminRegion)
  @JoinTable()
  replacedAdminRegions?: AdminRegion[];

  @OneToMany(
    () => SourcingLocation,
    (sourcingLocations: SourcingLocation) =>
      sourcingLocations.scenarioIntervention,
    { cascade: true, onDelete: 'CASCADE' },
  )
  replacedSourcingLocations?: SourcingLocation[];

  /**
   * Relationships with other entities - list of "new" relationships
   */
  @ManyToOne(() => Material)
  @ApiPropertyOptional({ type: () => Material })
  newMaterial?: Material;

  @ManyToOne(() => BusinessUnit)
  @ApiPropertyOptional()
  newBusinessUnit?: BusinessUnit;

  @ManyToOne(() => Supplier)
  @ApiPropertyOptional()
  newT1Supplier?: Supplier;

  @ManyToOne(() => Supplier)
  @ApiPropertyOptional()
  newProducer?: Supplier;

  @ManyToOne(() => GeoRegion)
  @ApiPropertyOptional()
  newGeoRegion?: GeoRegion;

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
  @Column({ nullable: true })
  newMaterialTonnageRatio?: number;

  /**
   * New Sourcing locations that will be created by Intervention
   */

  @OneToMany(
    () => SourcingLocation,
    (sourcingLocations: SourcingLocation) =>
      sourcingLocations.scenarioIntervention,
    { cascade: true, onDelete: 'CASCADE' },
  )
  newSourcingLocations?: SourcingLocation[];

  /**
   * Relationships with User
   */
  @ManyToOne(() => User, (user: User) => user.scenarioInterventionsLastEdited, {
    eager: false,
  })
  @ApiProperty({ type: () => User })
  lastEditedUser?: User;

  /**
   * @debt Auto-assign user and make not nullable
   */
  @Column({ nullable: true })
  @ApiPropertyOptional()
  lastEditedUserId?: string;
}
