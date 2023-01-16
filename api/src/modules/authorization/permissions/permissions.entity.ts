import {
  BaseEntity,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryColumn,
} from 'typeorm';
import { PERMISSIONS } from 'modules/authorization/permissions/permissions.enum';
import { Role } from 'modules/authorization/roles/role.entity';

@Entity('permissions')
export class Permission extends BaseEntity {
  @PrimaryColumn({ type: 'varchar', enum: PERMISSIONS })
  action!: PERMISSIONS;

  @ManyToMany(() => Role, (role: Role) => role.permissions)
  @JoinTable()
  roles: Role[];
}
