import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { BaseServiceResource } from 'types/resource.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from 'modules/users/user.entity';
import { Material } from 'modules/materials/material.entity';
import { BusinessUnit } from 'modules/business-units/business-unit.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { TimestampedBaseEntity } from 'baseEntities/timestamped-base-entity';

export enum SCENARIO_INTERVENTION_STATUS {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DELETED = 'deleted',
}

export enum SCENARIO_INTERVENTION_TYPE {
  DEFAULT = 'default',
}

export const scenarioResource: BaseServiceResource = {
  className: 'ScenarioIntervention',
  name: {
    singular: 'scenarioIntervention',
    plural: 'scenarioInterventions',
  },
  entitiesAllowedAsIncludes: [],
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
    default: SCENARIO_INTERVENTION_STATUS.INACTIVE,
  })
  status!: SCENARIO_INTERVENTION_STATUS;

  @ApiProperty()
  @Column({
    type: 'enum',
    enum: SCENARIO_INTERVENTION_TYPE,
    default: SCENARIO_INTERVENTION_TYPE.DEFAULT,
  })
  type!: SCENARIO_INTERVENTION_TYPE;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  startYear?: number;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  endYear?: number;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  percentage?: number;

  @Column({ type: 'jsonb', nullable: true })
  @ApiPropertyOptional()
  newIndicatorCoefficients?: JSON;

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
  replacedAdminRegion?: AdminRegion[];

  @ManyToMany(() => SourcingLocation)
  @JoinTable()
  replacedSourcingLocation?: SourcingLocation[];

  /**
   * Relationships with other entities - list of "new" relationships
   */
  @ManyToMany(() => Material)
  @JoinTable()
  newMaterials?: Material[];

  @ManyToMany(() => BusinessUnit)
  @JoinTable()
  newBusinessUnits?: BusinessUnit[];

  @ManyToMany(() => Supplier)
  @JoinTable()
  newSuppliers?: Supplier[];

  @ManyToMany(() => AdminRegion)
  @JoinTable()
  newAdminRegion?: AdminRegion[];

  @ManyToMany(() => SourcingLocation)
  @JoinTable()
  newSourcingLocation?: SourcingLocation[];

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
