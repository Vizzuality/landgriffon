import { BaseEntity, Entity, ManyToMany, PrimaryColumn } from 'typeorm';
import { ROLES } from 'modules/authorization/roles/roles.enum';
import { User } from 'modules/users/user.entity';
import { ApiProperty } from '@nestjs/swagger';

/**
 * This enum is used to validate role names; it needs to be updated if new
 * roles are added to the database.
 */

@Entity('roles')
export class Role extends BaseEntity {
  @ApiProperty({ type: ROLES, enum: ROLES })
  @PrimaryColumn({ type: 'varchar', enum: ROLES, default: ROLES.USER })
  name!: ROLES;

  @ManyToMany(() => User, (user: User) => user.roles)
  user: User[];

  // TODO: Move this to access control service in PR #3
  static createRolesFromEnum(roles: ROLES[]): Role[] {
    return roles.map((role: ROLES) => ({ name: role } as Role));
  }
}

// TODO: Add a new entity permissions / actions, for more customised authorisation logics.
//       We need a more detailed list of requirements to do so, for now we will add logics based on roles
