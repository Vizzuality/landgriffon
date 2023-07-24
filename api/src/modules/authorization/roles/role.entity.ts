import {
  BaseEntity,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryColumn,
} from 'typeorm';
import { ROLES } from 'modules/authorization/roles/roles.enum';
import { User } from 'modules/users/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Permission } from 'modules/authorization/permissions/permissions.entity';

/**
 * @description This enum is used to validate role names; it needs to be updated if new
 * roles are added to the database.
 *
 * @note: At some point we will have to let the user create custom role names (instead of using a enum)
 *        but we will control our claims/actions/permissions, which we will be using to perform auth
 */

@Entity('roles')
export class Role extends BaseEntity {
  @ApiProperty({ type: String, enum: ROLES })
  @PrimaryColumn({ type: 'varchar', unique: true })
  name!: ROLES;

  @ManyToMany(() => User, (user: User) => user.roles)
  user: User[];

  @ApiProperty({ type: [Permission] })
  @ManyToMany(() => Permission, (permission: Permission) => permission.roles, {
    eager: true,
  })
  @JoinTable({ name: 'roles_permissions' })
  permissions: Permission[];
}
