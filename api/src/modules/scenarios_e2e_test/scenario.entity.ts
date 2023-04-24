import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line no-restricted-imports
import { IScenario } from '../../../../shared/scenarios/scenario.interface';

import { BaseServiceResource } from 'types/resource.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ScenarioIntervention } from 'modules/scenario-interventions/scenario-intervention.entity';

type ExactProperties<T, U> = {
  [K in keyof (T & U)]: K extends keyof T
    ? K extends keyof U
      ? T[K] extends U[K]
        ? U[K]
        : never
      : T[K]
    : never;
};

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
  entitiesAllowedAsIncludes: ['scenarioInterventions'],
  columnsAllowedAsFilter: ['title', 'description', 'status', 'userId'],
};

@Entity()
export class Scenario implements ExactProperties<IScenario, Scenario> {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  dale: boolean;

  algo: string;

  @ApiProperty()
  @Column({ nullable: false })
  title!: string;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  description?: string;

  @ApiPropertyOptional({
    type: 'boolean',
    description: 'Make a Scenario public to all users',
  })
  @Column({ type: 'boolean', default: false, nullable: false })
  isPublic!: boolean;

  @ApiProperty({ enum: SCENARIO_STATUS })
  @Column({
    type: 'enum',
    enum: SCENARIO_STATUS,
    enumName: 'entityStatus',
    default: SCENARIO_STATUS.INACTIVE,
  })
  status!: string;

  @ApiPropertyOptional()
  @Column({ type: 'jsonb', nullable: true })
  metadata?: JSON;

  @OneToMany(
    () => ScenarioIntervention,
    (scenarioIntervention: ScenarioIntervention) =>
      scenarioIntervention.scenario,
  )
  scenarioInterventions: ScenarioIntervention[];
}
