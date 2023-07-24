import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  BaseEntity,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseServiceResource } from 'types/resource.interface';
import { IndicatorCoefficient } from 'modules/indicator-coefficients/indicator-coefficient.entity';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { SourcingLocationGroup } from 'modules/sourcing-location-groups/sourcing-location-group.entity';
import { Scenario } from 'modules/scenarios/scenario.entity';
import { ScenarioIntervention } from 'modules/scenario-interventions/scenario-intervention.entity';
import { Role } from 'modules/authorization/roles/role.entity';
import { Exclude } from 'class-transformer';
import { Task } from 'modules/tasks/task.entity';

export const userResource: BaseServiceResource = {
  className: 'User',
  name: {
    singular: 'user',
    plural: 'users',
  },
  entitiesAllowedAsIncludes: ['projects'],
  columnsAllowedAsFilter: ['email', 'title', 'fname', 'lname'],
};

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty()
  @Column('character varying', {
    unique: true,
  })
  email!: string;

  @ApiPropertyOptional({ type: String })
  @Column('character varying', { name: 'display_name', nullable: true })
  title?: string | null;

  @ApiPropertyOptional({ type: String })
  @Column('character varying', {
    nullable: true,
  })
  fname?: string | null;

  @ApiPropertyOptional({ type: String })
  @Column('character varying', {
    nullable: true,
  })
  lname?: string | null;

  /**
   * User avatar, stored as data url.
   *
   * For example: `data:image/gif;base64,<base64-encoded image binary data>
   */
  @ApiPropertyOptional()
  @Column('character varying', { name: 'avatar_data_url', nullable: true })
  avatarDataUrl?: string;

  @Exclude({ toPlainOnly: true })
  @Column('character varying', { name: 'password' })
  password!: string;

  @Exclude({ toPlainOnly: true })
  @Column('character varying', { name: 'salt' })
  salt!: string;

  /**
   * Whether this user is active (email is confirmed).
   */
  @ApiProperty()
  @Column('boolean', { name: 'is_active', default: false })
  isActive!: boolean;

  /**
   * Whether the user should be considered as deleted. This is used to implement
   * a grace period before full deletion.
   */
  @ApiProperty()
  @Column('boolean', { name: 'is_deleted', default: false })
  isDeleted!: boolean;

  @OneToMany(() => IndicatorCoefficient, (ic: IndicatorCoefficient) => ic.user)
  indicatorCoefficients: IndicatorCoefficient[];

  @OneToMany(() => SourcingLocation, (sc: SourcingLocation) => sc.updatedBy)
  sourcingLocations: SourcingLocation[];

  @OneToMany(
    () => SourcingLocationGroup,
    (sourcingLocationGroup: SourcingLocationGroup) =>
      sourcingLocationGroup.updatedBy,
  )
  sourcingLocationGroups: SourcingLocationGroup[];

  @OneToMany(() => Scenario, (scenario: Scenario) => scenario.user)
  scenarios: Scenario[];

  @OneToMany(() => Scenario, (scenario: Scenario) => scenario.updatedBy)
  scenariosLastEdited: Scenario[];

  @OneToMany(
    () => ScenarioIntervention,
    (scenarioIntervention: ScenarioIntervention) =>
      scenarioIntervention.updatedBy,
  )
  scenarioInterventionsLastEdited: ScenarioIntervention[];

  @OneToMany(() => Task, (task: Task) => task.user)
  tasks: Task[];

  @ApiProperty({ type: [Role] })
  @ManyToMany(() => Role, (role: Role) => role.user, { eager: true })
  @JoinTable({ name: 'user_roles' })
  roles: Role[];
}

export class JSONAPIUserData {
  @ApiProperty()
  type: string = userResource.name.plural;

  @ApiProperty()
  id!: string;

  @ApiProperty()
  attributes!: User;
}

export class UserResult {
  @ApiProperty()
  data!: JSONAPIUserData;
}
