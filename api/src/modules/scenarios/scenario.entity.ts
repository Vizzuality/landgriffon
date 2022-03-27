import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { BaseServiceResource } from 'types/resource.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from 'modules/users/user.entity';
import { TimestampedBaseEntity } from 'baseEntities/timestamped-base-entity';
import { ScenarioIntervention } from 'modules/scenario-interventions/scenario-intervention.entity';

export enum SCENARIO_STATUS {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DELETED = 'deleted',
}

export const scenarioResource: BaseServiceResource = {
  className: 'Scenario',
  name: {
    singular: 'scenario',
    plural: 'scenarios',
  },
  entitiesAllowedAsIncludes: [],
  columnsAllowedAsFilter: ['title', 'description', 'status', 'userId'],
};

@Entity()
export class Scenario extends TimestampedBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @ApiProperty()
  @Column({ nullable: false })
  title!: string;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  description?: string;

  @ApiProperty()
  @Column({
    type: 'enum',
    enum: SCENARIO_STATUS,
    enumName: 'entityStatus',
    default: SCENARIO_STATUS.INACTIVE,
  })
  status!: SCENARIO_STATUS;

  @ApiPropertyOptional()
  @Column({ type: 'jsonb', nullable: true })
  metadata?: JSON;

  @OneToMany(
    () => ScenarioIntervention,
    (scenarioIntervention: ScenarioIntervention) =>
      scenarioIntervention.scenario,
  )
  scenarioInterventions: ScenarioIntervention[];

  @ManyToOne(() => User, (user: User) => user.scenarios, {
    eager: false,
  })
  @ApiProperty({ type: () => User })
  user?: User;

  /**
   * @debt Auto-assign user and make not nullable
   */
  @Column({ nullable: true })
  @ApiPropertyOptional()
  userId?: string;

  @ManyToOne(() => User, (user: User) => user.scenariosLastEdited, {
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
